import React from "react";
import { Text, View } from "react-native";

import { useTheme } from "../theme/ThemeContext";

/**
 * Small markdown renderer for assistant replies: headings, bullet and numbered
 * lists, bold, italic and inline code. Mirrors the desktop renderer.
 */

const HEADING = /^\s*(#{1,6})\s+(.*)$/;
const BULLET = /^\s*[-*•]\s+(.*)$/;
const ORDERED = /^\s*\d+[.)]\s+(.*)$/;
const INLINE = /\*\*([^*]+)\*\*|__([^_]+)__|\*([^*\n]+)\*|`([^`]+)`/g;

/** A closing sentence tacked onto the last inline bullet, e.g. "…Coding Session I've moved two tasks." */
const TRAILING_SENTENCE =
  /^(.*?)\s+((?:I|I'm|I've|We|We've|You|Your|Let's|Here|There|That|This|These|All|Everything|It|Enjoy|Now)\b.*[.!?])$/;

/** The model often writes a whole list on one line: "Here's the plan: * **9 AM:** Gym * **11 AM:** Walk". */
function splitRunOnList(line: string): string[] {
  const parts = line.split(/\s+[*•]\s+(?=\S)/);
  if (parts.length < 3) return [line];

  const [lead, ...items] = parts;
  const last = items[items.length - 1].trim();
  const tail = TRAILING_SENTENCE.exec(last);
  if (tail) items[items.length - 1] = tail[1];

  const out = items.map((item) => `* ${item.trim()}`);
  if (tail) out.push("", tail[2]);
  return lead.trim() ? [lead.trim(), ...out] : out;
}

type Block =
  | { kind: "p"; lines: string[] }
  | { kind: "list"; ordered: boolean; items: string[] }
  | { kind: "heading"; text: string };

function toBlocks(source: string): Block[] {
  const lines = source
    .replace(/\r\n/g, "\n")
    .split("\n")
    .flatMap(splitRunOnList);

  const blocks: Block[] = [];
  let paragraph: string[] = [];

  const flush = () => {
    if (paragraph.length) blocks.push({ kind: "p", lines: paragraph });
    paragraph = [];
  };

  for (const raw of lines) {
    const line = raw.trimEnd();
    if (!line.trim()) {
      flush();
      continue;
    }

    const heading = HEADING.exec(line);
    if (heading) {
      flush();
      blocks.push({ kind: "heading", text: heading[2] });
      continue;
    }

    const bullet = BULLET.exec(line);
    const ordered = ORDERED.exec(line);
    if (bullet || ordered) {
      flush();
      const item = (bullet?.[1] ?? ordered?.[1] ?? "").trim();
      const isOrdered = Boolean(ordered);
      const previous = blocks[blocks.length - 1];
      if (previous?.kind === "list" && previous.ordered === isOrdered) previous.items.push(item);
      else blocks.push({ kind: "list", ordered: isOrdered, items: [item] });
      continue;
    }

    paragraph.push(line.trim());
  }

  flush();
  return blocks;
}

function Inline({ text }: { text: string }) {
  const { colors, fonts } = useTheme();
  const nodes: React.ReactNode[] = [];
  let last = 0;
  let match: RegExpExecArray | null;
  INLINE.lastIndex = 0;

  while ((match = INLINE.exec(text))) {
    if (match.index > last) nodes.push(text.slice(last, match.index));
    const key = `${match.index}`;
    const [, bold, boldAlt, italic, code] = match;
    if (bold ?? boldAlt) {
      nodes.push(
        <Text key={key} style={{ fontFamily: fonts.semibold, color: colors.ink }}>
          {bold ?? boldAlt}
        </Text>
      );
    } else if (italic) {
      nodes.push(
        <Text key={key} style={{ fontStyle: "italic" }}>
          {italic}
        </Text>
      );
    } else if (code) {
      nodes.push(
        <Text key={key} style={{ fontFamily: "monospace", fontSize: 13, color: colors.inkSoft }}>
          {` ${code} `}
        </Text>
      );
    }
    last = match.index + match[0].length;
  }

  if (last < text.length) nodes.push(text.slice(last));
  return <>{nodes.length ? nodes : text}</>;
}

export function Markdown({ text, color }: { text: string; color?: string }) {
  const { colors, fonts, type } = useTheme();
  const blocks = toBlocks(text);
  const bodyColor = color ?? colors.ink;

  return (
    <View style={{ gap: 8 }}>
      {blocks.map((block, i) => {
        if (block.kind === "heading") {
          return (
            <Text key={i} style={[type.heading, { color: bodyColor, fontSize: 15 }]}>
              <Inline text={block.text} />
            </Text>
          );
        }

        if (block.kind === "list") {
          return (
            <View key={i} style={{ gap: 5 }}>
              {block.items.map((item, j) => (
                <View key={j} style={{ flexDirection: "row", gap: 8 }}>
                  {block.ordered ? (
                    <Text
                      style={{
                        fontFamily: fonts.bold,
                        fontSize: 12,
                        color: colors.muted,
                        lineHeight: 21,
                        minWidth: 13,
                      }}
                    >
                      {j + 1}
                    </Text>
                  ) : (
                    <View
                      style={{
                        width: 6,
                        height: 6,
                        borderRadius: 3,
                        backgroundColor: colors.accent,
                        marginTop: 7,
                      }}
                    />
                  )}
                  <Text
                    style={[type.body, { color: bodyColor, flex: 1, lineHeight: 21 }]}
                  >
                    <Inline text={item} />
                  </Text>
                </View>
              ))}
            </View>
          );
        }

        return (
          <Text key={i} style={[type.body, { color: bodyColor, lineHeight: 21 }]}>
            {block.lines.map((line, j) => (
              <Text key={j}>
                {j > 0 ? "\n" : null}
                <Inline text={line} />
              </Text>
            ))}
          </Text>
        );
      })}
    </View>
  );
}
