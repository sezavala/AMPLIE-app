// components/WaveformMini.tsx
import { View } from "react-native";

export function WaveformMini({
  levels,
  color = "#999",
  height = 32,
}: {
  levels: number[];
  color?: string;
  height?: number;
}) {
  const bars = levels.slice(-40); // keep ~40 recent samples
  const width = 2;
  const gap = 2;

  return (
    <View
      style={{
        height,
        flexDirection: "row",
        alignItems: "center",
        overflow: "hidden",
      }}
    >
      {bars.map((v, i) => {
        const barHeight = Math.max(2, v * height);
        return (
          <View
            key={i}
            style={{
              width,
              height: barHeight,
              marginRight: gap,
              backgroundColor: color,
              borderRadius: 1,
              alignSelf: "center",
            }}
          />
        );
      })}
    </View>
  );
}
