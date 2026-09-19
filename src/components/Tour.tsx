import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { Dimensions, Modal, Pressable, Text, View } from "react-native";

import { useTheme } from "../theme/ThemeContext";
import { clayAccent, clayRaised, spacing } from "../theme/tokens";
import { CompanionFace } from "./ui";

const TOUR_FLAG = "lifeos_tour_pending";
const HOLE_PAD = 10;
const CARD_HEIGHT = 210;
/** Tab bar (72) plus a typical gesture inset — the tab bar cannot be measured by ref. */
const TAB_CHROME = 96;
const SCREEN_EDGE = 44;

/** Queue the walkthrough — called right after onboarding finishes. */
export async function requestTour() {
  try {
    await AsyncStorage.setItem(TOUR_FLAG, "1");
  } catch {
    /* no storage just means no tour */
  }
}

type Rect = { x: number; y: number; width: number; height: number };

type Step = {
  id: string;
  /** Target registered with useTourTarget, or a computed rect for chrome we cannot ref. */
  target?: string;
  rect?: (screen: { width: number; height: number }) => Rect;
  eyebrow?: string;
  title: string;
  body: string;
};

const STEPS: Step[] = [
  {
    id: "intro",
    title: "Meet LifeOS",
    body: "Your day, your tasks and your calendar all live in one conversation. A minute here and you will know the whole app.",
  },
  {
    id: "composer",
    target: "composer",
    eyebrow: "Talk, don't fill forms",
    title: "Say it in plain words",
    body: "“Dentist Thursday at 4, remind me an hour before.” LifeOS writes the task, books the time and sets the reminder.",
  },
  {
    id: "suggestions",
    target: "suggestions",
    eyebrow: "Not sure where to start",
    title: "Borrow a starter",
    body: "Tap one of these to drop a ready-made request into the box. Edit it before sending if you like.",
  },
  {
    id: "tabs",
    rect: (screen) => ({
      x: 6,
      y: screen.height - TAB_CHROME,
      width: screen.width - 12,
      height: TAB_CHROME - 4,
    }),
    eyebrow: "Everything in reach",
    title: "Plan, tasks and settings",
    body: "Plan is your month and day view, Tasks is the running list, Settings holds themes, reminders and your AI key.",
  },
  {
    id: "account",
    target: "account",
    eyebrow: "Your account",
    title: "You live up here",
    body: "Jump to settings or sign out from your avatar, any time.",
  },
  {
    id: "done",
    title: "That's the whole app",
    body: "Start with one sentence about today. You can replay this walkthrough from Settings.",
  },
];

type Measurable = { measureInWindow: (cb: (x: number, y: number, w: number, h: number) => void) => void };

type TourContextValue = {
  register: (id: string, node: Measurable | null) => void;
  start: () => void;
};

const TourContext = createContext<TourContextValue | null>(null);

/** Attach to any View you want the tour to spotlight. */
export function useTourTarget(id: string) {
  const ctx = useContext(TourContext);
  const ref = useRef<View | null>(null);
  return {
    ref: (node: View | null) => {
      ref.current = node;
      ctx?.register(id, node as Measurable | null);
    },
    collapsable: false as const,
  };
}

export function useTour() {
  const ctx = useContext(TourContext);
  return { start: ctx?.start ?? (() => {}) };
}

export function TourProvider({ children }: { children: ReactNode }) {
  const { colors, radii, type, theme } = useTheme();
  const targets = useRef(new Map<string, Measurable>());
  const [active, setActive] = useState(false);
  const [index, setIndex] = useState(0);
  const [rect, setRect] = useState<Rect | null>(null);

  const register = useCallback((id: string, node: Measurable | null) => {
    if (node) targets.current.set(id, node);
    else targets.current.delete(id);
  }, []);

  const start = useCallback(() => {
    setIndex(0);
    setActive(true);
  }, []);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const pending = await AsyncStorage.getItem(TOUR_FLAG);
        if (!cancelled && pending === "1") setTimeout(() => setActive(true), 600);
      } catch {
        /* ignore */
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const screen = Dimensions.get("window");
  const step = STEPS[index];

  const finish = useCallback(() => {
    setActive(false);
    setIndex(0);
    void AsyncStorage.removeItem(TOUR_FLAG).catch(() => undefined);
  }, []);

  const next = useCallback(() => {
    setIndex((i) => {
      if (i >= STEPS.length - 1) {
        setActive(false);
        void AsyncStorage.removeItem(TOUR_FLAG).catch(() => undefined);
        return 0;
      }
      return i + 1;
    });
  }, []);

  useEffect(() => {
    if (!active || !step) return;
    if (step.rect) {
      setRect(step.rect(screen));
      return;
    }
    if (!step.target) {
      setRect(null);
      return;
    }
    const node = targets.current.get(step.target);
    if (!node) {
      setRect(null);
      return;
    }
    // Layout can still be settling right after the tab mounts.
    const t = setTimeout(() => {
      node.measureInWindow((x, y, width, height) => {
        if (!width && !height) return setRect(null);
        setRect({
          x: x - HOLE_PAD,
          y: y - HOLE_PAD,
          width: width + HOLE_PAD * 2,
          height: height + HOLE_PAD * 2,
        });
      });
    }, 120);
    return () => clearTimeout(t);
  }, [active, step, screen.width, screen.height]);

  const value = useMemo(() => ({ register, start }), [register, start]);
  const veil = theme === "professional" ? "rgba(0,0,0,0.62)" : "rgba(58,40,46,0.42)";

  const cardTop = (() => {
    if (!rect) return Math.max(SCREEN_EDGE + 20, screen.height / 2 - CARD_HEIGHT / 2 - 20);
    const below = rect.y + rect.height + 14;
    if (below + CARD_HEIGHT < screen.height - SCREEN_EDGE) return below;
    return Math.max(SCREEN_EDGE, rect.y - CARD_HEIGHT - 14);
  })();

  const isIntro = step?.id === "intro";
  const isLast = index === STEPS.length - 1;

  return (
    <TourContext.Provider value={value}>
      {children}
      <Modal visible={active} transparent statusBarTranslucent animationType="fade">
        <View style={{ flex: 1 }}>
          {rect ? (
            <>
              <View
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  right: 0,
                  height: Math.max(0, rect.y),
                  backgroundColor: veil,
                }}
              />
              <View
                style={{
                  position: "absolute",
                  top: rect.y + rect.height,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  backgroundColor: veil,
                }}
              />
              <View
                style={{
                  position: "absolute",
                  top: rect.y,
                  left: 0,
                  width: Math.max(0, rect.x),
                  height: rect.height,
                  backgroundColor: veil,
                }}
              />
              <View
                style={{
                  position: "absolute",
                  top: rect.y,
                  left: rect.x + rect.width,
                  right: 0,
                  height: rect.height,
                  backgroundColor: veil,
                }}
              />
              <View
                pointerEvents="none"
                style={{
                  position: "absolute",
                  top: rect.y,
                  left: rect.x,
                  width: rect.width,
                  height: rect.height,
                  borderRadius: radii.lg,
                  borderWidth: 2,
                  borderColor: colors.accent,
                }}
              />
            </>
          ) : (
            <View style={{ flex: 1, backgroundColor: veil }} />
          )}

          <View
            style={[
              clayRaised(colors, { radius: radii.xl, lift: 16 }),
              {
                position: "absolute",
                top: cardTop,
                left: spacing.md,
                right: spacing.md,
                padding: spacing.md,
                gap: 7,
              },
            ]}
          >
            {isIntro || isLast ? <CompanionFace size={46} /> : null}
            {step?.eyebrow ? (
              <Text
                style={[
                  type.caption,
                  {
                    color: colors.accent,
                    textTransform: "uppercase",
                    letterSpacing: 1,
                    fontSize: 10.5,
                  },
                ]}
              >
                {step.eyebrow}
              </Text>
            ) : null}
            <Text style={[type.display, { color: colors.ink, fontSize: 23 }]}>{step?.title}</Text>
            <Text style={[type.body, { color: colors.muted, lineHeight: 21 }]}>{step?.body}</Text>

            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
                marginTop: 10,
              }}
            >
              <View style={{ flexDirection: "row", gap: 5 }}>
                {STEPS.map((s, i) => (
                  <View
                    key={s.id}
                    style={{
                      width: i === index ? 16 : 6,
                      height: 6,
                      borderRadius: 3,
                      backgroundColor: i === index ? colors.accent : colors.line,
                    }}
                  />
                ))}
              </View>

              <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
                {!isLast ? (
                  <Pressable onPress={finish} hitSlop={8}>
                    <Text style={[type.label, { color: colors.muted, fontSize: 13 }]}>Skip</Text>
                  </Pressable>
                ) : null}
                <Pressable
                  onPress={next}
                  style={({ pressed }) => [
                    clayAccent(colors, { radius: 999, lift: 6 }),
                    { paddingHorizontal: 18, paddingVertical: 10 },
                    pressed ? { transform: [{ scale: 0.97 }] } : null,
                  ]}
                >
                  <Text style={[type.label, { color: colors.accentInk, fontSize: 13 }]}>
                    {isIntro ? "Show me around" : isLast ? "Start using LifeOS" : "Next"}
                  </Text>
                </Pressable>
              </View>
            </View>
          </View>
        </View>
      </Modal>
    </TourContext.Provider>
  );
}
