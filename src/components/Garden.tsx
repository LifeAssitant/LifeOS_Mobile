import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import {
  AccessibilityInfo,
  Animated,
  Easing,
  Pressable,
  Text,
  View,
  type ViewStyle,
} from "react-native";
import { useFocusEffect, useRouter } from "expo-router";

import { api } from "../api/client";
import { useTheme } from "../theme/ThemeContext";
import { clayAccent } from "../theme/tokens";
import type { ThemeName } from "../theme/tokens";

type Piece = { id: string; min: number; arrived: string; next: string };
type TimeOfDay = "morning" | "afternoon" | "evening" | "night";
type FlowerKind = "daisy" | "poppy" | "lavender" | "tulip" | "rose" | "sunflower";

const PIECES: Piece[] = [
  { id: "tufts", min: 1, arrived: "Grass has covered the soil.", next: "grass covers the soil" },
  { id: "daisy", min: 2, arrived: "Daisies opened.", next: "daisies open" },
  { id: "mushroom", min: 3, arrived: "A mushroom settled in.", next: "a mushroom settles in" },
  { id: "can", min: 4, arrived: "A watering can waits by the bed.", next: "a watering can shows up" },
  { id: "stones", min: 5, arrived: "Stepping stones cross the grass.", next: "stepping stones cross the grass" },
  { id: "poppy", min: 6, arrived: "Poppies joined the bed.", next: "poppies join the bed" },
  { id: "lavender", min: 7, arrived: "Lavender lined the path.", next: "lavender lines the path" },
  { id: "butterflies", min: 8, arrived: "Butterflies found the blooms.", next: "butterflies find the blooms" },
  { id: "tulip", min: 9, arrived: "Tulips stood tall.", next: "tulips stand tall" },
  { id: "bench", min: 10, arrived: "There is a bench to sit on.", next: "a bench arrives" },
  { id: "bush", min: 11, arrived: "A rose bush filled out.", next: "a rose bush fills out" },
  { id: "fence", min: 12, arrived: "A picket fence holds the yard.", next: "a picket fence wraps the back" },
  { id: "vine", min: 13, arrived: "Vines climbed the fence.", next: "vines climb the fence" },
  { id: "lantern", min: 14, arrived: "The lantern is lit.", next: "a lantern lights" },
  { id: "fern", min: 15, arrived: "Ferns unfurled in the shade.", next: "ferns unfurl in the shade" },
  { id: "tree", min: 16, arrived: "An oak has taken root.", next: "an oak takes root" },
  { id: "pine", min: 18, arrived: "A pine stands by the path.", next: "a pine stands by the path" },
  { id: "cottage", min: 20, arrived: "A cottage sits at the back.", next: "a cottage lands at the back" },
  { id: "sunflower", min: 22, arrived: "Sunflowers turned to the light.", next: "sunflowers turn to the light" },
  { id: "pond", min: 24, arrived: "A pond gathered in front.", next: "a pond gathers" },
  { id: "hedge", min: 26, arrived: "A hedge rounded the edge.", next: "a hedge rounds the edge" },
  { id: "lights", min: 28, arrived: "Lights are strung for the evening.", next: "evening lights go up" },
];

type GardenPaint = {
  sky: string;
  horizon: string;
  grassHi: string;
  grass: string;
  grassDeep: string;
  leaf: string;
  soil: string;
  soilDeep: string;
  wall: string;
  wallShade: string;
  roof: string;
  wood: string;
  stem: string;
  water: string;
  petal: string;
  poppy: string;
  lavender: string;
  tulip: string;
  rose: string;
  sunflower: string;
  cap: string;
  butter: string;
  bulb: string;
  ink: string;
  inkSoft: string;
  sunGlow: string;
  disk: string;
  veil: string;
  star: string;
};

const BASE: Record<ThemeName, GardenPaint> = {
  playful: {
    sky: "#d8f3e4",
    horizon: "#f8e4c4",
    grassHi: "#d2f3a4",
    grass: "#7dce78",
    grassDeep: "#3e9b5c",
    leaf: "#2f864c",
    soil: "#c89564",
    soilDeep: "#8a5e3c",
    wall: "#fff7f0",
    wallShade: "#efd5c2",
    roof: "#f4846f",
    wood: "#d4895c",
    stem: "#3c8c50",
    water: "#79c4e4",
    petal: "#fffaf6",
    poppy: "#ef6d7a",
    lavender: "#9b86e8",
    tulip: "#f39a78",
    rose: "#e85d75",
    sunflower: "#edb64e",
    cap: "#e07868",
    butter: "#f3d56a",
    bulb: "#ffe7a4",
    ink: "#3d4a3c",
    inkSoft: "#526354",
    sunGlow: "rgba(243,213,106,0.45)",
    disk: "#f3d56a",
    veil: "transparent",
    star: "rgba(255,255,255,0.85)",
  },
  professional: {
    sky: "#24362d",
    horizon: "#1a2822",
    grassHi: "#a4d092",
    grass: "#5f9a68",
    grassDeep: "#2f6a45",
    leaf: "#2a6848",
    soil: "#8a6848",
    soilDeep: "#5c4030",
    wall: "#efe6da",
    wallShade: "#d5c4b4",
    roof: "#d98978",
    wood: "#c48a62",
    stem: "#3d7a4e",
    water: "#6aa4b8",
    petal: "#f6f1e8",
    poppy: "#e08a92",
    lavender: "#a898d8",
    tulip: "#d98978",
    rose: "#c86b7a",
    sunflower: "#d4a84a",
    cap: "#d08074",
    butter: "#e2c56a",
    bulb: "#f0d48a",
    ink: "#f4f7f5",
    inkSoft: "#c9d4ce",
    sunGlow: "rgba(226,197,106,0.2)",
    disk: "#e2c56a",
    veil: "transparent",
    star: "rgba(230,235,245,0.8)",
  },
};

function getTimeOfDay(date = new Date()): TimeOfDay {
  const hour = date.getHours();
  if (hour >= 5 && hour < 11) return "morning";
  if (hour >= 11 && hour < 16) return "afternoon";
  if (hour >= 16 && hour < 20) return "evening";
  return "night";
}

function paintForTod(theme: ThemeName, tod: TimeOfDay): GardenPaint & { diskX: `${number}%`; diskY: number } {
  const base = BASE[theme];
  if (theme === "playful") {
    if (tod === "morning") {
      return {
        ...base,
        sky: "#f7d4b0",
        horizon: "#b7dff0",
        grassHi: "#dff5b0",
        grass: "#86d484",
        disk: "#ffc98a",
        sunGlow: "rgba(255,200,140,0.4)",
        veil: "rgba(255,220,180,0.12)",
        diskX: "18%",
        diskY: 28,
      };
    }
    if (tod === "evening") {
      return {
        ...base,
        sky: "#f0a070",
        horizon: "#c97b8e",
        grass: "#6fb86a",
        grassDeep: "#347a4a",
        disk: "#ff9a5c",
        sunGlow: "rgba(255,140,80,0.4)",
        veil: "rgba(180,70,60,0.14)",
        bulb: "#ffe0a0",
        diskX: "78%",
        diskY: 36,
      };
    }
    if (tod === "night") {
      return {
        ...base,
        sky: "#1a2744",
        horizon: "#0e1628",
        grassHi: "#6a9a62",
        grass: "#3f6f4a",
        grassDeep: "#244832",
        leaf: "#2a5a3c",
        water: "#3f6f88",
        disk: "#e8eef8",
        sunGlow: "rgba(200,220,255,0.22)",
        veil: "rgba(10,16,36,0.28)",
        ink: "#e8eef4",
        inkSoft: "#b8c4d0",
        diskX: "72%",
        diskY: 18,
      };
    }
    return { ...base, sky: "#b7e8f4", horizon: "#d8f3e4", diskX: "84%", diskY: 14 };
  }

  if (tod === "morning") {
    return {
      ...base,
      sky: "#3a4038",
      horizon: "#2a322c",
      sunGlow: "rgba(240,190,130,0.18)",
      veil: "rgba(255,200,140,0.06)",
      disk: "#e0b878",
      diskX: "18%",
      diskY: 28,
    };
  }
  if (tod === "evening") {
    return {
      ...base,
      sky: "#3a2a28",
      horizon: "#241820",
      sunGlow: "rgba(220,120,80,0.2)",
      veil: "rgba(120,50,40,0.16)",
      disk: "#d98968",
      diskX: "78%",
      diskY: 36,
    };
  }
  if (tod === "night") {
    return {
      ...base,
      sky: "#121820",
      horizon: "#0a0e14",
      grassHi: "#5a8a58",
      grass: "#3a6048",
      grassDeep: "#1e3828",
      disk: "#d8e0ec",
      sunGlow: "rgba(160,180,220,0.12)",
      veil: "rgba(0,0,0,0.22)",
      diskX: "72%",
      diskY: 18,
    };
  }
  return { ...base, diskX: "84%", diskY: 14 };
}

function gardenCopy(done: number, tod: TimeOfDay) {
  const todNote =
    tod === "morning"
      ? "Morning light softens the yard."
      : tod === "afternoon"
        ? "Afternoon sun warms the leaves."
        : tod === "evening"
          ? "Evening gold settles over the beds."
          : "Night hush holds the garden.";

  const title =
    done < 1
      ? "Quiet soil"
      : done < 5
        ? "First green"
        : done < 10
          ? "A small bed"
          : done < 16
            ? "Somewhere to sit"
            : done < 24
              ? "The cottage yard"
              : "A living garden";

  if (done < 1) {
    return {
      title,
      line: `A sprout is curled up. Finish a task and grass covers the soil. ${todNote}`,
    };
  }

  const arrived = [...PIECES].reverse().find((piece) => piece.min <= done);
  const upcoming = PIECES.find((piece) => piece.min > done);
  const count = done === 1 ? "One thing finished" : `${done} things finished`;
  const next = upcoming ? ` Next, ${upcoming.next}.` : " The yard is full, and it can stay this way.";
  return {
    title,
    line: `${count}. ${arrived?.arrived ?? "The yard keeps growing."}${next} ${todNote}`,
  };
}

function useTimeOfDay() {
  const [tod, setTod] = useState<TimeOfDay>(() => getTimeOfDay());
  useEffect(() => {
    const tick = () => setTod(getTimeOfDay());
    tick();
    const id = setInterval(tick, 60_000);
    return () => clearInterval(id);
  }, []);
  return tod;
}

function PieceView({
  x,
  y,
  show,
  pop,
  reduceMotion,
  children,
}: {
  x: `${number}%`;
  y: `${number}%`;
  show: boolean;
  pop: boolean;
  reduceMotion: boolean;
  children: ReactNode;
}) {
  const scale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (!pop || reduceMotion) return;
    scale.setValue(0.15);
    Animated.spring(scale, { toValue: 1, friction: 5, useNativeDriver: true }).start();
  }, [pop, reduceMotion, scale]);

  if (!show) return null;
  return (
    <Animated.View
      pointerEvents="none"
      style={{ position: "absolute", left: x, top: y, transform: [{ scale }] }}
    >
      {children}
    </Animated.View>
  );
}

function Flower({ g, kind, scale = 1 }: { g: GardenPaint; kind: FlowerKind; scale?: number }) {
  const s = 6 * scale;
  if (kind === "lavender") {
    return (
      <View style={{ width: s * 2, height: s * 4.4, alignItems: "center" }}>
        <View style={{ width: 2.5, height: 12 * scale, borderRadius: 2, backgroundColor: g.stem, marginBottom: -2 }} />
        <View
          style={{
            width: 5 * scale,
            height: 14 * scale,
            borderRadius: 8,
            backgroundColor: g.lavender,
          }}
        />
      </View>
    );
  }
  if (kind === "tulip") {
    return (
      <View style={{ width: s * 2.2, height: s * 4.4, alignItems: "center" }}>
        <View style={{ width: 3, height: 14 * scale, borderRadius: 2, backgroundColor: g.stem, marginBottom: -2 }} />
        <View
          style={{
            width: 10 * scale,
            height: 12 * scale,
            borderTopLeftRadius: 10,
            borderTopRightRadius: 10,
            borderBottomLeftRadius: 4,
            borderBottomRightRadius: 4,
            backgroundColor: g.tulip,
          }}
        />
      </View>
    );
  }
  if (kind === "rose") {
    return (
      <View style={{ width: s * 2.4, height: s * 3.6, alignItems: "center" }}>
        <View style={{ width: 2.5, height: 10 * scale, borderRadius: 2, backgroundColor: g.stem, marginBottom: -2 }} />
        <View
          style={{
            width: 10 * scale,
            height: 10 * scale,
            borderRadius: 99,
            backgroundColor: g.rose,
            borderWidth: 2,
            borderColor: "#f07a8c",
          }}
        />
      </View>
    );
  }
  if (kind === "sunflower") {
    return (
      <View style={{ width: s * 3.6, height: s * 5.2, alignItems: "center" }}>
        <View style={{ width: 4, height: 18 * scale, borderRadius: 2, backgroundColor: g.stem, marginBottom: -2 }} />
        <View style={{ width: s * 3.2, height: s * 3.2, alignItems: "center", justifyContent: "center" }}>
          {(
            [
              [0, -1],
              [0, 1],
              [-1, 0],
              [1, 0],
              [0.7, -0.7],
              [-0.7, -0.7],
              [0.7, 0.7],
              [-0.7, 0.7],
            ] as const
          ).map(([dx, dy], i) => (
            <View
              key={i}
              style={{
                position: "absolute",
                width: s * 0.85,
                height: s * 0.85,
                borderRadius: s,
                backgroundColor: g.sunflower,
                transform: [{ translateX: dx * s }, { translateY: dy * s }],
              }}
            />
          ))}
          <View style={{ width: s * 0.9, height: s * 0.9, borderRadius: 99, backgroundColor: "#6b4226" }} />
        </View>
      </View>
    );
  }

  const petal = kind === "poppy" ? g.poppy : g.petal;
  const center = kind === "poppy" ? "#9c3040" : g.butter;
  return (
    <View style={{ width: s * 3.2, height: s * 4.2, alignItems: "center" }}>
      <View
        style={{
          width: 3,
          height: 14 * scale,
          borderRadius: 2,
          backgroundColor: g.stem,
          marginBottom: -2,
        }}
      />
      <View style={{ width: s * 3, height: s * 3, alignItems: "center", justifyContent: "center" }}>
        {(
          [
            [0, -0.85],
            [0, 0.85],
            [-0.85, 0],
            [0.85, 0],
          ] as const
        ).map(([dx, dy], i) => (
          <View
            key={i}
            style={{
              position: "absolute",
              width: s,
              height: s,
              borderRadius: s,
              backgroundColor: petal,
              transform: [{ translateX: dx * s * 0.85 }, { translateY: dy * s * 0.85 }],
            }}
          />
        ))}
        <View
          style={{
            width: s * 0.75,
            height: s * 0.75,
            borderRadius: 99,
            backgroundColor: center,
          }}
        />
      </View>
    </View>
  );
}

function Cottage({ g, vine }: { g: GardenPaint; vine?: boolean }) {
  return (
    <View style={{ alignItems: "center", width: 52 }}>
      <View
        style={{
          width: 8,
          height: 12,
          borderRadius: 2,
          backgroundColor: g.wallShade,
          marginLeft: 16,
          marginBottom: -4,
          zIndex: 2,
        }}
      />
      <View
        style={{
          width: 0,
          height: 0,
          borderLeftWidth: 24,
          borderRightWidth: 24,
          borderBottomWidth: 16,
          borderLeftColor: "transparent",
          borderRightColor: "transparent",
          borderBottomColor: g.roof,
        }}
      />
      <View
        style={{
          width: 40,
          height: 26,
          marginTop: -1,
          borderRadius: 4,
          backgroundColor: g.wall,
          borderRightWidth: 5,
          borderRightColor: g.wallShade,
          flexDirection: "row",
          alignItems: "flex-end",
          justifyContent: "space-between",
          paddingHorizontal: 6,
          paddingBottom: 0,
        }}
      >
        <View style={{ width: 9, height: 14, borderTopLeftRadius: 5, borderTopRightRadius: 5, backgroundColor: g.wood }} />
        <View
          style={{
            width: 10,
            height: 10,
            borderRadius: 6,
            backgroundColor: g.water,
            marginBottom: 8,
            borderWidth: 1.5,
            borderColor: "rgba(255,255,255,0.7)",
          }}
        />
      </View>
      {vine ? (
        <View style={{ position: "absolute", left: 0, top: 14, gap: 3 }}>
          <View style={{ width: 8, height: 6, borderRadius: 4, backgroundColor: g.leaf }} />
          <View style={{ width: 7, height: 5, borderRadius: 4, backgroundColor: g.grassHi, marginLeft: 3 }} />
          <View style={{ width: 8, height: 6, borderRadius: 4, backgroundColor: g.leaf, marginLeft: 1 }} />
        </View>
      ) : null}
    </View>
  );
}

function Oak({ g }: { g: GardenPaint }) {
  return (
    <View style={{ alignItems: "center", width: 44 }}>
      <View style={{ width: 36, height: 28 }}>
        <View
          style={{
            position: "absolute",
            left: 2,
            top: 8,
            width: 20,
            height: 20,
            borderRadius: 12,
            backgroundColor: g.grassDeep,
          }}
        />
        <View
          style={{
            position: "absolute",
            right: 0,
            top: 6,
            width: 18,
            height: 18,
            borderRadius: 10,
            backgroundColor: g.leaf,
          }}
        />
        <View
          style={{
            position: "absolute",
            left: 8,
            top: 0,
            width: 22,
            height: 22,
            borderRadius: 12,
            backgroundColor: g.grassHi,
          }}
        />
      </View>
      <View
        style={{
          width: 7,
          height: 18,
          marginTop: -6,
          borderRadius: 3,
          backgroundColor: "#8d5434",
        }}
      />
    </View>
  );
}

function Pine({ g }: { g: GardenPaint }) {
  return (
    <View style={{ alignItems: "center", width: 36 }}>
      <View
        style={{
          width: 0,
          height: 0,
          borderLeftWidth: 10,
          borderRightWidth: 10,
          borderBottomWidth: 12,
          borderLeftColor: "transparent",
          borderRightColor: "transparent",
          borderBottomColor: g.grassHi,
        }}
      />
      <View
        style={{
          width: 0,
          height: 0,
          marginTop: -4,
          borderLeftWidth: 13,
          borderRightWidth: 13,
          borderBottomWidth: 14,
          borderLeftColor: "transparent",
          borderRightColor: "transparent",
          borderBottomColor: g.leaf,
        }}
      />
      <View
        style={{
          width: 0,
          height: 0,
          marginTop: -4,
          borderLeftWidth: 16,
          borderRightWidth: 16,
          borderBottomWidth: 16,
          borderLeftColor: "transparent",
          borderRightColor: "transparent",
          borderBottomColor: g.grassDeep,
        }}
      />
      <View style={{ width: 5, height: 12, marginTop: -2, borderRadius: 2, backgroundColor: "#6e4024" }} />
    </View>
  );
}

function ButterflyWing({ color, flip }: { color: string; flip?: boolean }) {
  return (
    <View
      style={{
        width: 7,
        height: 8,
        borderRadius: flip ? 2 : 6,
        borderTopLeftRadius: flip ? 6 : 2,
        borderBottomRightRadius: flip ? 6 : 2,
        backgroundColor: color,
        marginLeft: flip ? -1 : 0,
      }}
    />
  );
}

export function Garden({
  compact = false,
  fill = false,
  refreshKey = 0,
}: {
  compact?: boolean;
  fill?: boolean;
  refreshKey?: number;
}) {
  const router = useRouter();
  const { theme, type, colors, radii } = useTheme();
  const tod = useTimeOfDay();
  const g = paintForTod(theme, tod);
  const [done, setDone] = useState(0);
  const [reduceMotion, setReduceMotion] = useState(false);
  const prevRef = useRef(0);
  const [popFrom, setPopFrom] = useState<number | null>(null);
  const flutter = useRef(new Animated.Value(0)).current;
  const flutterLate = useRef(new Animated.Value(0)).current;

  const load = useCallback(async () => {
    try {
      const finished = await api.tasks("done");
      setDone(finished.length);
    } catch {
      /* keep the yard as it is until the next sync */
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      void load();
    }, [load])
  );

  useEffect(() => {
    void load();
  }, [load, refreshKey]);

  useEffect(() => {
    const before = prevRef.current;
    if (done > before && done - before <= 2) setPopFrom(before);
    prevRef.current = done;
  }, [done]);

  useEffect(() => {
    let mounted = true;
    void AccessibilityInfo.isReduceMotionEnabled().then((value) => {
      if (mounted) setReduceMotion(value);
    });
    const sub = AccessibilityInfo.addEventListener("reduceMotionChanged", setReduceMotion);
    return () => {
      mounted = false;
      sub.remove();
    };
  }, []);

  useEffect(() => {
    if (reduceMotion || done < 8) return;
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(flutter, {
          toValue: 1,
          duration: 3600,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(flutter, {
          toValue: 0,
          duration: 3600,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [done, flutter, reduceMotion]);

  useEffect(() => {
    if (reduceMotion || done < 18) return;
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(flutterLate, {
          toValue: 1,
          duration: 4200,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(flutterLate, {
          toValue: 0,
          duration: 4200,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [done, flutterLate, reduceMotion]);

  const copy = gardenCopy(done, tod);
  const show = (min: number) => done >= min;
  const popped = (min: number) => popFrom != null && min > popFrom && min <= done;
  const grown = show(1);
  const stageH = compact ? 148 : 196;
  const nightish = tod === "night" || tod === "evening";

  const spot = (
    id: string,
    x: `${number}%`,
    y: `${number}%`,
    style: ViewStyle | undefined,
    node: React.ReactNode,
    forceShow = false
  ) => {
    const piece = PIECES.find((item) => item.id === id);
    const min = piece?.min ?? 0;
    return (
      <PieceView
        key={id}
        x={x}
        y={y}
        show={forceShow || show(min)}
        pop={!forceShow && popped(min)}
        reduceMotion={reduceMotion}
      >
        <View style={style}>{node}</View>
      </PieceView>
    );
  };

  return (
    <View
      accessibilityRole="summary"
      accessibilityLabel={`${copy.title}. ${copy.line}`}
      style={[
        { borderRadius: 22, overflow: "hidden", backgroundColor: g.horizon },
        fill ? { flex: 1 } : null,
      ]}
    >
      <View style={{ height: fill ? undefined : stageH, flex: fill ? 1 : undefined, backgroundColor: g.sky }}>
        <View
          pointerEvents="none"
          style={{
            position: "absolute",
            top: g.diskY,
            left: g.diskX,
            marginLeft: -13,
            width: 26,
            height: 26,
            borderRadius: 13,
            backgroundColor: g.disk,
            shadowColor: g.disk,
            shadowOpacity: tod === "night" ? 0.55 : 0.8,
            shadowRadius: tod === "night" ? 10 : 8,
            shadowOffset: { width: 0, height: 0 },
          }}
        />
        <View
          pointerEvents="none"
          style={{
            position: "absolute",
            top: g.diskY - 4,
            left: g.diskX,
            marginLeft: -17,
            width: 34,
            height: 34,
            borderRadius: 17,
            backgroundColor: g.sunGlow,
          }}
        />

        {tod === "night"
          ? (
              [
                ["12%", 22],
                ["28%", 14],
                ["46%", 26],
                ["62%", 12],
                ["88%", 20],
              ] as const
            ).map(([left, top], i) => (
              <View
                key={i}
                pointerEvents="none"
                style={{
                  position: "absolute",
                  left,
                  top,
                  width: i % 2 === 0 ? 3 : 2,
                  height: i % 2 === 0 ? 3 : 2,
                  borderRadius: 2,
                  backgroundColor: g.star,
                  opacity: 0.7 + (i % 3) * 0.1,
                }}
              />
            ))
          : null}

        <View
          pointerEvents="none"
          style={{ position: "absolute", top: 0, right: 0, bottom: 0, left: 0, backgroundColor: g.veil }}
        />

        {show(8) ? (
          <Animated.View
            pointerEvents="none"
            style={{
              position: "absolute",
              left: "16%",
              top: 18,
              flexDirection: "row",
              transform: [
                {
                  translateX: flutter.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0, compact ? 48 : 72],
                  }),
                },
                {
                  translateY: flutter.interpolate({
                    inputRange: [0, 0.5, 1],
                    outputRange: [0, 8, 2],
                  }),
                },
              ],
            }}
          >
            <ButterflyWing color={g.poppy} />
            <ButterflyWing color={g.butter} flip />
          </Animated.View>
        ) : null}

        {show(18) ? (
          <Animated.View
            pointerEvents="none"
            style={{
              position: "absolute",
              left: "58%",
              top: 28,
              flexDirection: "row",
              transform: [
                {
                  translateX: flutterLate.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0, compact ? -40 : -54],
                  }),
                },
                {
                  translateY: flutterLate.interpolate({
                    inputRange: [0, 0.5, 1],
                    outputRange: [0, 6, 1],
                  }),
                },
              ],
            }}
          >
            <ButterflyWing color={g.lavender} />
            <ButterflyWing color={g.petal} flip />
          </Animated.View>
        ) : null}

        {show(28) ? (
          <View
            pointerEvents="none"
            style={{
              position: "absolute",
              top: 8,
              left: "8%",
              right: "18%",
              flexDirection: "row",
              justifyContent: "space-between",
            }}
          >
            {Array.from({ length: 6 }).map((_, i) => (
              <View
                key={i}
                style={{
                  width: 6,
                  height: 6,
                  borderRadius: 3,
                  marginTop: i % 2 === 0 ? 6 : 14,
                  backgroundColor: g.bulb,
                  shadowColor: g.bulb,
                  shadowOpacity: nightish ? 0.9 : 0.35,
                  shadowRadius: nightish ? 6 : 2,
                  shadowOffset: { width: 0, height: 0 },
                }}
              />
            ))}
          </View>
        ) : null}

        <View
          style={{
            position: "absolute",
            left: compact ? "10%" : "8%",
            right: compact ? "10%" : "8%",
            top: compact ? 28 : 36,
            bottom: compact ? 10 : 16,
          }}
        >
          <View
            style={{
              position: "absolute",
              left: "4%",
              right: "4%",
              top: "18%",
              bottom: 0,
              borderRadius: 999,
              backgroundColor: g.soilDeep,
            }}
          />
          <View
            style={{
              position: "absolute",
              left: "2%",
              right: "2%",
              top: "8%",
              bottom: "14%",
              borderRadius: 999,
              backgroundColor: grown ? g.grassDeep : g.soil,
            }}
          />
          <View
            style={{
              position: "absolute",
              left: "6%",
              right: "7%",
              top: 0,
              bottom: "22%",
              borderRadius: 999,
              backgroundColor: grown ? g.grass : g.soil,
            }}
          />

          <PieceView x="46%" y="62%" show pop={false} reduceMotion={reduceMotion}>
            <View
              style={{
                width: 4,
                height: grown ? 20 : 12,
                borderRadius: 3,
                backgroundColor: g.grassHi,
                transform: [{ rotate: grown ? "6deg" : "-28deg" }],
              }}
            />
          </PieceView>
          <PieceView x="72%" y="64%" show pop={false} reduceMotion={reduceMotion}>
            <View style={{ width: 12, height: 8, borderRadius: 6, backgroundColor: "#c3ad98" }} />
          </PieceView>

          {spot("tufts", "34%", "68%", undefined, (
            <View style={{ flexDirection: "row", alignItems: "flex-end", gap: 2 }}>
              <View style={{ width: 3, height: 10, borderRadius: 2, backgroundColor: g.grassHi, transform: [{ rotate: "-12deg" }] }} />
              <View style={{ width: 3, height: 14, borderRadius: 2, backgroundColor: g.grassHi }} />
              <View style={{ width: 3, height: 11, borderRadius: 2, backgroundColor: g.grassHi, transform: [{ rotate: "12deg" }] }} />
            </View>
          ))}
          {spot("daisy", "18%", "40%", { flexDirection: "row", alignItems: "flex-end" }, (
            <>
              <Flower g={g} kind="daisy" />
              <Flower g={g} kind="daisy" scale={0.8} />
            </>
          ))}
          {spot("mushroom", "62%", "58%", { alignItems: "center" }, (
            <>
              <View
                style={{
                  width: 18,
                  height: 12,
                  borderRadius: 10,
                  backgroundColor: g.cap,
                  marginBottom: -2,
                }}
              />
              <View style={{ width: 6, height: 10, borderRadius: 2, backgroundColor: g.petal }} />
            </>
          ))}
          {spot("can", "8%", "50%", undefined, (
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <View
                style={{
                  width: 7,
                  height: 10,
                  borderWidth: 2,
                  borderRightWidth: 0,
                  borderColor: "#5aa4c4",
                  borderTopLeftRadius: 6,
                  borderBottomLeftRadius: 6,
                }}
              />
              <View style={{ width: 12, height: 14, borderRadius: 4, backgroundColor: g.water }} />
              <View style={{ width: 8, height: 3, borderRadius: 2, backgroundColor: g.water, marginTop: -6 }} />
            </View>
          ))}
          {spot("stones", "42%", "52%", { width: 36, height: 28 }, (
            <>
              <View style={{ position: "absolute", left: 0, top: 16, width: 12, height: 8, borderRadius: 6, backgroundColor: "#efe6da" }} />
              <View style={{ position: "absolute", left: 12, top: 8, width: 11, height: 7, borderRadius: 6, backgroundColor: "#f7f1e8" }} />
              <View style={{ position: "absolute", left: 18, top: 0, width: 12, height: 8, borderRadius: 6, backgroundColor: "#e4d8cc" }} />
            </>
          ))}
          {spot("poppy", "48%", "36%", { flexDirection: "row", alignItems: "flex-end" }, (
            <>
              <Flower g={g} kind="poppy" />
              <Flower g={g} kind="poppy" scale={0.75} />
            </>
          ))}
          {spot("lavender", "14%", "56%", { flexDirection: "row", alignItems: "flex-end", gap: 2 }, (
            <>
              <Flower g={g} kind="lavender" />
              <Flower g={g} kind="lavender" scale={0.85} />
              <Flower g={g} kind="lavender" scale={0.7} />
            </>
          ))}
          {spot("tulip", "70%", "34%", { flexDirection: "row", alignItems: "flex-end", gap: 2 }, (
            <>
              <Flower g={g} kind="tulip" />
              <Flower g={g} kind="tulip" scale={0.85} />
            </>
          ))}
          {spot("bush", "28%", "44%", { width: 36, height: 28 }, (
            <>
              <View style={{ position: "absolute", left: 2, top: 8, width: 22, height: 16, borderRadius: 12, backgroundColor: g.leaf }} />
              <View style={{ position: "absolute", left: 12, top: 4, width: 18, height: 14, borderRadius: 10, backgroundColor: g.grassHi }} />
              <View style={{ position: "absolute", left: 8, top: 0 }}>
                <Flower g={g} kind="rose" scale={0.7} />
              </View>
            </>
          ))}
          {spot("bench", "30%", "28%", undefined, (
            <View>
              <View
                style={{
                  width: 34,
                  height: 5,
                  borderRadius: 2,
                  backgroundColor: g.wood,
                  marginBottom: 2,
                }}
              />
              <View
                style={{
                  width: 34,
                  height: 7,
                  borderRadius: 3,
                  backgroundColor: g.wood,
                }}
              />
            </View>
          ))}
          {spot("fence", "34%", "14%", { flexDirection: "row", alignItems: "flex-end", gap: 3 }, (
            Array.from({ length: 7 }).map((_, i) => (
              <View
                key={i}
                style={{
                  width: 4,
                  height: i === 0 || i === 6 ? 12 : 16,
                  borderRadius: 1,
                  backgroundColor: g.wood,
                }}
              />
            ))
          ))}
          {spot("vine", "36%", "8%", { width: 40, height: 22 }, (
            <>
              <View style={{ position: "absolute", left: 4, top: 2, width: 3, height: 18, borderRadius: 2, backgroundColor: g.stem, transform: [{ rotate: "-16deg" }] }} />
              <View style={{ position: "absolute", left: 22, top: 4, width: 3, height: 16, borderRadius: 2, backgroundColor: g.stem, transform: [{ rotate: "12deg" }] }} />
              <View style={{ position: "absolute", left: 0, top: 6, width: 9, height: 6, borderRadius: 4, backgroundColor: g.leaf }} />
              <View style={{ position: "absolute", left: 10, top: 12, width: 8, height: 5, borderRadius: 4, backgroundColor: g.grassHi }} />
              <View style={{ position: "absolute", left: 24, top: 8, width: 9, height: 6, borderRadius: 4, backgroundColor: g.leaf }} />
            </>
          ))}
          {spot("lantern", "86%", "34%", { alignItems: "center" }, (
            <>
              <View
                style={{
                  width: 8,
                  height: 10,
                  borderRadius: 2,
                  backgroundColor: g.bulb,
                  shadowColor: g.bulb,
                  shadowOpacity: nightish ? 0.95 : 0.4,
                  shadowRadius: nightish ? 8 : 3,
                  shadowOffset: { width: 0, height: 0 },
                }}
              />
              <View style={{ width: 2, height: 16, backgroundColor: "#8d6a52" }} />
            </>
          ))}
          {spot("fern", "84%", "54%", { flexDirection: "row", alignItems: "flex-end", gap: 1 }, (
            <>
              <View style={{ width: 4, height: 14, borderRadius: 3, backgroundColor: g.leaf, transform: [{ rotate: "-24deg" }] }} />
              <View style={{ width: 4, height: 18, borderRadius: 3, backgroundColor: g.grassHi, transform: [{ rotate: "-6deg" }] }} />
              <View style={{ width: 4, height: 16, borderRadius: 3, backgroundColor: g.leaf, transform: [{ rotate: "10deg" }] }} />
              <View style={{ width: 4, height: 13, borderRadius: 3, backgroundColor: g.grass, transform: [{ rotate: "24deg" }] }} />
            </>
          ))}
          {spot("tree", "6%", "8%", undefined, <Oak g={g} />)}
          {spot("pine", "0%", "22%", undefined, <Pine g={g} />)}
          {spot("cottage", "58%", "6%", undefined, <Cottage g={g} vine={show(13)} />)}
          {spot("sunflower", "4%", "42%", { flexDirection: "row", alignItems: "flex-end" }, (
            <>
              <Flower g={g} kind="sunflower" scale={0.85} />
              <Flower g={g} kind="sunflower" scale={0.7} />
            </>
          ))}
          {spot("pond", "36%", "70%", undefined, (
            <View
              style={{
                width: 42,
                height: 22,
                borderRadius: 16,
                backgroundColor: g.water,
                justifyContent: "center",
                paddingLeft: 8,
              }}
            >
              <View style={{ width: 10, height: 7, borderRadius: 5, backgroundColor: g.leaf }} />
              <View
                style={{
                  position: "absolute",
                  right: 6,
                  top: -6,
                  width: 3,
                  height: 14,
                  borderRadius: 2,
                  backgroundColor: g.leaf,
                  transform: [{ rotate: "8deg" }],
                }}
              />
            </View>
          ))}
          {spot("hedge", "78%", "16%", { flexDirection: "row", alignItems: "flex-end" }, (
            <>
              <View style={{ width: 16, height: 12, borderRadius: 8, backgroundColor: g.grassDeep }} />
              <View style={{ width: 18, height: 14, borderRadius: 9, backgroundColor: g.leaf, marginLeft: -4 }} />
              <View style={{ width: 14, height: 11, borderRadius: 7, backgroundColor: g.grass, marginLeft: -3 }} />
            </>
          ))}
        </View>
      </View>

      <View style={{ backgroundColor: g.horizon, paddingHorizontal: 12, paddingTop: 2, paddingBottom: 10 }}>
        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 10 }}>
          <Text style={[type.heading, { color: g.ink, fontSize: compact ? 15 : 17, flex: 1 }]}>
            {copy.title}
          </Text>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Open garden store"
            onPress={() => router.push("/garden-store")}
            style={[
              clayAccent(colors, { radius: radii.pill, lift: 4 }),
              { paddingVertical: compact ? 5 : 6, paddingHorizontal: compact ? 10 : 12 },
            ]}
          >
            <Text style={[type.label, { color: colors.accentInk, fontSize: 12 }]}>Store</Text>
          </Pressable>
        </View>
        <Text style={[type.caption, { color: g.inkSoft, marginTop: 2, lineHeight: 17 }]}>
          {copy.line}
        </Text>
      </View>
    </View>
  );
}
