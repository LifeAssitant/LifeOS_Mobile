import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  RecordingPresets,
  requestRecordingPermissionsAsync,
  setAudioModeAsync,
  useAudioRecorder,
} from "expo-audio";
import * as Speech from "expo-speech";
import {
  ExpoSpeechRecognitionModule,
  useSpeechRecognitionEvent,
} from "expo-speech-recognition";
import { useCallback, useEffect, useRef, useState } from "react";
import { Platform } from "react-native";

import { api } from "./api/client";

const SPEAK_KEY = "lifeos_speak_replies";

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

export function useVoiceRecorder() {
  const recorder = useAudioRecorder(RecordingPresets.HIGH_QUALITY);
  const [status, setStatus] = useState<VoiceStatus>("idle");
  const [liveText, setLiveText] = useState("");
  const statusRef = useRef<VoiceStatus>("idle");
  const liveRef = useRef("");
  const committedRef = useRef("");
  const usingSpeechRef = useRef(false);

  useEffect(() => {
    statusRef.current = status;
  }, [status]);

  useEffect(() => {
    liveRef.current = liveText;
  }, [liveText]);

  useSpeechRecognitionEvent("result", (event) => {
    if (statusRef.current !== "listening" || !usingSpeechRef.current) return;
    const piece = event.results.map((row) => row.transcript).join(" ").trim();
    const next = event.isFinal
      ? `${committedRef.current} ${piece}`.replace(/\s+/g, " ").trim()
      : `${committedRef.current} ${piece}`.replace(/\s+/g, " ").trim();
    if (event.isFinal) committedRef.current = next;
    liveRef.current = next;
    setLiveText(next);
  });

  useSpeechRecognitionEvent("end", () => {
    if (statusRef.current !== "listening" || !usingSpeechRef.current) return;
    committedRef.current = liveRef.current;
    try {
      ExpoSpeechRecognitionModule.start({
        lang: locale(),
        interimResults: true,
        continuous: true,
        addsPunctuation: true,
      });
    } catch {
      /* already running */
    }
  });

  useEffect(() => {
    return () => {
      stopSpeaking();
      usingSpeechRef.current = false;
      try {
        ExpoSpeechRecognitionModule.abort();
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
    usingSpeechRef.current = false;
    setStatus("listening");
  }, [recorder]);

  const begin = useCallback(async () => {
    if (statusRef.current !== "idle") return;
    stopSpeaking();
    committedRef.current = "";
    liveRef.current = "";
    setLiveText("");
    try {
      const permission = await ExpoSpeechRecognitionModule.requestPermissionsAsync();
      if (permission.granted) {
        usingSpeechRef.current = true;
        ExpoSpeechRecognitionModule.start({
          lang: locale(),
          interimResults: true,
          continuous: true,
          addsPunctuation: true,
        });
        setStatus("listening");
        return;
      }
    } catch {
      usingSpeechRef.current = false;
    }
    await beginRecording();
  }, [beginRecording]);

  const finish = useCallback(async (): Promise<string> => {
    if (statusRef.current !== "listening") return "";
    setStatus("transcribing");
    if (usingSpeechRef.current) {
      usingSpeechRef.current = false;
      try {
        ExpoSpeechRecognitionModule.stop();
      } catch {
        try {
          ExpoSpeechRecognitionModule.abort();
        } catch {
          /* ignore */
        }
      }
      setStatus("idle");
      return liveRef.current.trim();
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
  }, [recorder]);

  const cancel = useCallback(async () => {
    if (statusRef.current === "idle") return;
    usingSpeechRef.current = false;
    try {
      ExpoSpeechRecognitionModule.abort();
    } catch {
      /* ignore */
    }
    try {
      if (recorder.isRecording) await recorder.stop();
    } catch {
      /* ignore */
    }
    setLiveText("");
    setStatus("idle");
  }, [recorder]);

  return {
    status,
    liveText,
    begin,
    finish,
    cancel,
  };
}
