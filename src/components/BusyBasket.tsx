import { useRef, useState } from "react";
import {
  Animated,
  LayoutChangeEvent,
  PanResponder,
  Pressable,
  Text,
  View,
} from "react-native";

import { useTheme } from "../theme/ThemeContext";
import { clayInset, clayRaised } from "../theme/tokens";

export const BUSY_LEVELS = [
  { label: "Empty basket", note: "Drop something in to tell us" },
  { label: "Cruising", note: "There is room in most days" },
  { label: "Steady", note: "A few fixed things, plenty of slack" },
  { label: "Full", note: "Most days are properly booked" },
  { label: "Stacked", note: "Back to back, not much air" },
  { label: "Overflowing", note: "More than fits, honestly" },
];

type PieceId = "book" | "mug" | "apple" | "clock" | "ball";

/** Loose pieces start scattered around the basket, as fractions of the yard. */
const PIECES: Array<{ id: PieceId; spot: { x: number; y: number } }> = [
  { id: "book", spot: { x: 0.03, y: 0.02 } },
  { id: "mug", spot: { x: 0.36, y: 0.0 } },
  { id: "apple", spot: { x: 0.72, y: 0.05 } },
  { id: "clock", spot: { x: 0.85, y: 0.38 } },
  { id: "ball", spot: { x: 0.0, y: 0.42 } },
];

const YARD_HEIGHT = 250;
const PIECE = 52;
const PACKED = 44;
const BASKET_W = 200;
const BASKET_H = 118;

function PieceArt({ id, color, size }: { id: PieceId; color: string; size: number }) {
  const unit = size * 0.42;
  const common = { backgroundColor: color } as const;
  switch (id) {
    case "book":
      return (
        <View style={{ width: unit, height: unit * 0.82, justifyContent: "space-between" }}>
          <View style={[{ height: 4, borderRadius: 2 }, common]} />
          <View style={[{ height: 4, borderRadius: 2, opacity: 0.55 }, common]} />
          <View style={[{ height: 4, borderRadius: 2, opacity: 0.35 }, common]} />
        </View>
      );
    case "mug":
      return (
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <View style={[{ width: unit * 0.8, height: unit, borderRadius: 6 }, common]} />
          <View
            style={{
              width: unit * 0.4,
              height: unit * 0.55,
              borderWidth: 3,
              borderLeftWidth: 0,
              borderColor: color,
              borderTopRightRadius: 8,
              borderBottomRightRadius: 8,
            }}
          />
        </View>
      );
    case "apple":
      return (
        <View style={{ alignItems: "center" }}>
          <View style={{ width: 3, height: unit * 0.3, borderRadius: 2, backgroundColor: color }} />
          <View style={[{ width: unit, height: unit, borderRadius: unit / 2 }, common]} />
        </View>
      );
    case "clock":
      return (
        <View
          style={{
            width: unit,
            height: unit,
            borderRadius: unit / 2,
            borderWidth: 3,
            borderColor: color,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <View style={{ width: 3, height: unit * 0.3, borderRadius: 2, backgroundColor: color }} />
        </View>
      );
    default:
      return (
        <View
          style={{
            width: unit,
            height: unit,
            borderRadius: unit / 2,
            backgroundColor: color,
            overflow: "hidden",
            justifyContent: "center",
          }}
        >
          <View style={{ height: 3, backgroundColor: "rgba(255,255,255,0.7)" }} />
        </View>
      );
  }
}

/** Where a packed piece sits inside the basket — a loose pile, not a grid. */
function pileSpot(index: number) {
  const row = Math.floor(index / 3);
  const col = index % 3;
  return {
    left: 22 + col * 46 + (row === 1 ? 22 : 0),
    bottom: 14 + row * 32,
    rotate: [-9, 5, -4, 8, -6][index % 5],
  };
}

function DraggablePiece({
  id,
  color,
  start,
  onDrop,
}: {
  id: PieceId;
  color: string;
  start: { x: number; y: number };
  onDrop: (id: PieceId, x: number, y: number) => boolean;
}) {
  const home = useRef(start);
  const pan = useRef(new Animated.ValueXY(start)).current;
  const [dragging, setDragging] = useState(false);
  const { colors, radii } = useTheme();

  const responder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: () => {
        setDragging(true);
        pan.setOffset({ ...home.current });
        pan.setValue({ x: 0, y: 0 });
      },
      onPanResponderMove: Animated.event([null, { dx: pan.x, dy: pan.y }], {
        useNativeDriver: false,
      }),
      onPanResponderRelease: (_evt, gesture) => {
        setDragging(false);
        pan.flattenOffset();
        const x = home.current.x + gesture.dx;
        const y = home.current.y + gesture.dy;
        // A tap without movement counts as "toss it in" — dragging is not the only way.
        const tapped = Math.abs(gesture.dx) < 6 && Math.abs(gesture.dy) < 6;
        const packed = onDrop(id, tapped ? -1 : x, tapped ? -1 : y);
        if (packed) return;
        home.current = { x, y };
      },
    })
  ).current;

  return (
    <Animated.View
      {...responder.panHandlers}
      style={[
        clayRaised(colors, { radius: radii.md, lift: dragging ? 12 : 7 }),
        {
          position: "absolute",
          width: PIECE,
          height: PIECE,
          alignItems: "center",
          justifyContent: "center",
          transform: [...pan.getTranslateTransform(), { scale: dragging ? 1.08 : 1 }],
          zIndex: dragging ? 5 : 1,
        },
      ]}
    >
      <PieceArt id={id} color={color} size={PIECE} />
    </Animated.View>
  );
}

export function BusyBasket({ value, onChange }: { value: number; onChange: (n: number) => void }) {
  const { colors, radii, type } = useTheme();
  const [width, setWidth] = useState(0);
  const [packed, setPacked] = useState<PieceId[]>([]);

  const tones = [colors.peach, colors.sky, colors.mint, colors.lilac, colors.butter];
  const busyColors = [colors.muted, colors.mint, colors.sky, colors.butter, colors.peach, colors.danger];
  const state = BUSY_LEVELS[Math.min(value, 5)];
  const busyColor = busyColors[Math.min(value, 5)];

  const basket = {
    x: (width - BASKET_W) / 2,
    y: YARD_HEIGHT - BASKET_H - 6,
    width: BASKET_W,
    height: BASKET_H,
  };

  const onDrop = (id: PieceId, x: number, y: number) => {
    const tapped = x < 0 && y < 0;
    const centerX = x + PIECE / 2;
    const centerY = y + PIECE / 2;
    const inside =
      tapped ||
      (centerX > basket.x &&
        centerX < basket.x + basket.width &&
        centerY > basket.y - 14 &&
        centerY < basket.y + basket.height);
    if (!inside) return false;
    setPacked((prev) => {
      if (prev.includes(id)) return prev;
      const next = [...prev, id];
      onChange(next.length);
      return next;
    });
    return true;
  };

  const unpack = (id: PieceId) =>
    setPacked((prev) => {
      const next = prev.filter((p) => p !== id);
      onChange(next.length);
      return next;
    });

  const onLayout = (e: LayoutChangeEvent) => setWidth(e.nativeEvent.layout.width);

  return (
    <View style={{ gap: 10 }}>
      <View
        onLayout={onLayout}
        style={[clayInset(colors, { radius: radii.lg }), { height: YARD_HEIGHT, overflow: "hidden" }]}
      >
        {/* Basket */}
        <View
          style={{
            position: "absolute",
            left: basket.x,
            top: basket.y,
            width: BASKET_W,
            height: BASKET_H,
          }}
        >
          <View
            style={[
              clayRaised(colors, { radius: 14, lift: 10, background: colors.surface2 }),
              {
                position: "absolute",
                left: 10,
                right: 10,
                top: 16,
                bottom: 0,
                borderBottomLeftRadius: 34,
                borderBottomRightRadius: 34,
                borderWidth: 2,
                borderColor: value > 0 ? busyColor : colors.line,
                overflow: "hidden",
              },
            ]}
          >
            {[0, 1, 2].map((i) => (
              <View
                key={i}
                style={{
                  position: "absolute",
                  left: 8,
                  right: 8,
                  top: 22 + i * 24,
                  height: 2,
                  borderRadius: 2,
                  backgroundColor: colors.line,
                }}
              />
            ))}
          </View>

          {packed.map((id, i) => {
            const spot = pileSpot(i);
            const tone = tones[PIECES.findIndex((p) => p.id === id)] ?? colors.accent;
            return (
              <Pressable
                key={id}
                onPress={() => unpack(id)}
                style={[
                  clayRaised(colors, { radius: 13, lift: 5 }),
                  {
                    position: "absolute",
                    left: spot.left,
                    bottom: spot.bottom,
                    width: PACKED,
                    height: PACKED,
                    alignItems: "center",
                    justifyContent: "center",
                    transform: [{ rotate: `${spot.rotate}deg` }],
                  },
                ]}
              >
                <PieceArt id={id} color={tone} size={PACKED} />
              </Pressable>
            );
          })}

          {/* Front rim, drawn over the pile so items read as inside. */}
          <View
            style={[
              clayRaised(colors, { radius: 999, lift: 6 }),
              { position: "absolute", left: 0, right: 0, top: 0, height: 22 },
            ]}
          />
        </View>

        {/* Loose pieces */}
        {width > 0
          ? PIECES.map((piece, i) =>
              packed.includes(piece.id) ? null : (
                <DraggablePiece
                  key={piece.id}
                  id={piece.id}
                  color={tones[i]}
                  start={{
                    x: piece.spot.x * (width - PIECE),
                    y: piece.spot.y * (YARD_HEIGHT - PIECE),
                  }}
                  onDrop={onDrop}
                />
              )
            )
          : null}
      </View>

      <View style={{ alignItems: "center" }}>
        <Text style={[type.display, { color: busyColor, fontSize: 19 }]}>{state.label}</Text>
        <Text style={[type.caption, { color: colors.muted, marginTop: 2 }]}>{state.note}</Text>
      </View>
    </View>
  );
}
