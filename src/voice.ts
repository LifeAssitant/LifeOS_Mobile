import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  RecordingPresets,
  requestRecordingPermissionsAsync,
  setAudioModeAsync,
  useAudioRecorder,
  useAudioStream,
} from "expo-audio";
import * as Speech from "expo-speech";
import { useCallback, useEffect, useRef, useState } from "react";
import { Platform } from "react-native";

import { api } from "./api/client";

const SPEAK_KEY = "lifeos_speak_replies";
const LIVE_MS = 1700;
const MIN_LIVE_BYTES = 16000;

export type VoiceStatus = "idle" | "listening" | "transcribing";

function locale(): string {
  return Intl.DateTimeFormat().resolvedOptions().locale || "en-US";
}

export function speakableText(markdown: string): string {
  const cleaned = markdown
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/`([^`]+)`/g, "$1")
    .replace(/\*\*([^*]+)\*\*/g, "$1")
    .replace(/\*([^*]+)\*/g, "$1")
    .replace(/#+\s/g, "")
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .replace(/\s+/g, " ")
    .trim();
  return cleaned.length > 700 ? `${cleaned.slice(0, 680).trim()}…` : cleaned;
}

export async function getSpeakReplies(): Promise<boolean> {
  try {
    const value = await AsyncStorage.getItem(SPEAK_KEY);
    return value !== "0";
  } catch {
    return true;
  }
}

export async function setSpeakReplies(on: boolean): Promise<void> {
  try {
    await AsyncStorage.setItem(SPEAK_KEY, on ? "1" : "0");
  } catch {
    /* ignore */
  }
}

export function stopSpeaking() {
  void Speech.stop();
}

export async function speakReply(markdown: string): Promise<boolean> {
  if (!(await getSpeakReplies())) return false;
  const text = speakableText(markdown);
  if (!text) return false;
  await Speech.stop();
  Speech.speak(text, {
    rate: 0.98,
    pitch: 1,
    language: locale(),
  });
  return true;
}

function mimeFromUri(uri: string): { name: string; type: string } {
  const lower = uri.toLowerCase();
  if (lower.endsWith(".webm")) return { name: "voice.webm", type: "audio/webm" };
  if (lower.endsWith(".wav")) return { name: "voice.wav", type: "audio/wav" };
  if (lower.endsWith(".mp3")) return { name: "voice.mp3", type: "audio/mpeg" };
  if (lower.endsWith(".ogg")) return { name: "voice.ogg", type: "audio/ogg" };
  if (lower.endsWith(".3gp") || lower.endsWith(".3gpp")) {
    return { name: "voice.3gp", type: "audio/3gpp" };
  }
  return { name: "voice.m4a", type: "audio/mp4" };
}

function concatBytes(parts: Uint8Array[]): Uint8Array {
  const total = parts.reduce((sum, part) => sum + part.byteLength, 0);
  const out = new Uint8Array(total);
  let offset = 0;
  for (const part of parts) {
    out.set(part, offset);
    offset += part.byteLength;
  }
  return out;
}

function encodeWav(pcm: Uint8Array, sampleRate: number): Uint8Array {
  const dataSize = pcm.byteLength;
  const buffer = new ArrayBuffer(44 + dataSize);
  const view = new DataView(buffer);
  const ascii = (offset: number, text: string) => {
    for (let i = 0; i < text.length; i++) view.setUint8(offset + i, text.charCodeAt(i));
  };
  ascii(0, "RIFF");
  view.setUint32(4, 36 + dataSize, true);
  ascii(8, "WAVE");
  ascii(12, "fmt ");
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);
  view.setUint16(22, 1, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * 2, true);
  view.setUint16(32, 2, true);
  view.setUint16(34, 16, true);
  ascii(36, "data");
  view.setUint32(40, dataSize, true);
  new Uint8Array(buffer, 44).set(pcm);
  return new Uint8Array(buffer);
}

function bytesToBase64(bytes: Uint8Array): string {
  let binary = "";
  const step = 0x8000;
  for (let i = 0; i < bytes.length; i += step) {
    binary += String.fromCharCode(...bytes.subarray(i, i + step));
  }
  return btoa(binary);
}

export function useVoiceRecorder() {
  const recorder = useAudioRecorder(RecordingPresets.HIGH_QUALITY);
  const pcmParts = useRef<Uint8Array[]>([]);
  const sampleRateRef = useRef(16000);
  const { stream } = useAudioStream({
    sampleRate: 16000,
    channels: 1,
    encoding: "int16",
    onBuffer: (buffer) => {
      sampleRateRef.current = buffer.sampleRate || 16000;
      pcmParts.current.push(new Uint8Array(buffer.data));
    },
  });
  const [status, setStatus] = useState<VoiceStatus>("idle");
  const [liveText, setLiveText] = useState("");
  const statusRef = useRef<VoiceStatus>("idle");
  const liveRef = useRef("");
  const usingStreamRef = useRef(false);
  const liveTimer = useRef<ReturnType<typeof setInterval> | null>(null);
  const liveBusy = useRef(false);

  useEffect(() => {
    statusRef.current = status;
  }, [status]);

  useEffect(() => {
    liveRef.current = liveText;
  }, [liveText]);

  const stopLiveTimer = useCallback(() => {
    if (liveTimer.current) {
      clearInterval(liveTimer.current);
      liveTimer.current = null;
    }
  }, []);

  const snapshotTranscript = useCallback(async () => {
    if (liveBusy.current || statusRef.current !== "listening" || !usingStreamRef.current) return;
    const pcm = concatBytes(pcmParts.current);
    if (pcm.byteLength < MIN_LIVE_BYTES) return;
    liveBusy.current = true;
    try {
      const wav = encodeWav(pcm, sampleRateRef.current);
      const { text } = await api.chatTranscribeBase64(bytesToBase64(wav), "audio/wav");
      if (text.trim() && statusRef.current === "listening") {
        liveRef.current = text.trim();
        setLiveText(text.trim());
      }
    } catch {
      /* keep last live line */
    } finally {
      liveBusy.current = false;
    }
  }, []);

  const startLiveTimer = useCallback(() => {
    stopLiveTimer();
    liveTimer.current = setInterval(() => {
      void snapshotTranscript();
    }, LIVE_MS);
  }, [snapshotTranscript, stopLiveTimer]);

  useEffect(() => {
    return () => {
      stopSpeaking();
      stopLiveTimer();
      try {
        stream.stop();
      } catch {
        /* ignore */
      }
      if (recorder.isRecording) {
        void recorder.stop().catch(() => undefined);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const beginRecording = useCallback(async () => {
    const permission = await requestRecordingPermissionsAsync();
    if (!permission.granted) {
      throw new Error("Allow the microphone to talk to LifeOS.");
    }
    await setAudioModeAsync({
      allowsRecording: true,
      playsInSilentMode: true,
    });
    await recorder.prepareToRecordAsync();
    recorder.record();
    usingStreamRef.current = false;
    setStatus("listening");
  }, [recorder]);

  const begin = useCallback(async () => {
    if (statusRef.current !== "idle") return;
    stopSpeaking();
    liveRef.current = "";
    setLiveText("");
    pcmParts.current = [];
    const permission = await requestRecordingPermissionsAsync();
    if (!permission.granted) {
      throw new Error("Allow the microphone to talk to LifeOS.");
    }
    await setAudioModeAsync({
      allowsRecording: true,
      playsInSilentMode: true,
    });
    try {
      usingStreamRef.current = true;
      await stream.start();
      setStatus("listening");
      startLiveTimer();
      return;
    } catch {
      usingStreamRef.current = false;
    }
    await beginRecording();
  }, [beginRecording, startLiveTimer, stream]);

  const finish = useCallback(async (): Promise<string> => {
    if (statusRef.current !== "listening") return "";
    stopLiveTimer();
    setStatus("transcribing");
    if (usingStreamRef.current) {
      usingStreamRef.current = false;
      try {
        stream.stop();
      } catch {
        /* ignore */
      }
      try {
        const pcm = concatBytes(pcmParts.current);
        pcmParts.current = [];
        if (pcm.byteLength >= MIN_LIVE_BYTES) {
          const wav = encodeWav(pcm, sampleRateRef.current);
          const { text } = await api.chatTranscribeBase64(bytesToBase64(wav), "audio/wav");
          setStatus("idle");
          return (text || liveRef.current).trim();
        }
        setStatus("idle");
        return liveRef.current.trim();
      } catch (err) {
        setStatus("idle");
        if (liveRef.current.trim()) return liveRef.current.trim();
        throw err;
      }
    }
    try {
      await recorder.stop();
      const uri = recorder.uri;
      if (!uri) {
        setStatus("idle");
        return "";
      }
      const { name, type } = mimeFromUri(uri);
      const { text } = await api.chatTranscribe(uri, name, type);
      setStatus("idle");
      return text.trim();
    } catch (err) {
      setStatus("idle");
      throw err;
    } finally {
      if (Platform.OS === "ios") {
        void setAudioModeAsync({ allowsRecording: false, playsInSilentMode: true });
      }
    }
  }, [recorder, stopLiveTimer, stream]);

  const cancel = useCallback(async () => {
    if (statusRef.current === "idle") return;
    stopLiveTimer();
    usingStreamRef.current = false;
    try {
      stream.stop();
    } catch {
      /* ignore */
    }
    try {
      if (recorder.isRecording) await recorder.stop();
    } catch {
      /* ignore */
    }
    pcmParts.current = [];
    setLiveText("");
    setStatus("idle");
  }, [recorder, stopLiveTimer, stream]);

  return {
    status,
    liveText,
    begin,
    finish,
    cancel,
  };
}
