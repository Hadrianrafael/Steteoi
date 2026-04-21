import React from "react";
import Svg, { Circle, Defs, Line, RadialGradient, Stop } from "react-native-svg";

import { game } from "@/constants/colors";
import type { GameMap } from "@/lib/maps";

export function MapPreview({
  map,
  size = 220,
}: {
  map: GameMap;
  size?: number;
}) {
  const w = map.width;
  const h = map.height;
  return (
    <Svg width={size} height={(size * h) / w} viewBox={`0 0 ${w} ${h}`}>
      <Defs>
        <RadialGradient id="glow" cx="50%" cy="50%" r="50%">
          <Stop offset="0%" stopColor={game.gold} stopOpacity="0.3" />
          <Stop offset="100%" stopColor={game.gold} stopOpacity="0" />
        </RadialGradient>
      </Defs>
      {map.territories.map((t) =>
        t.adj.map((adjId) => {
          const o = map.territories.find((x) => x.id === adjId);
          if (!o || adjId < t.id) return null;
          return (
            <Line
              key={`${t.id}-${adjId}`}
              x1={t.x}
              y1={t.y}
              x2={o.x}
              y2={o.y}
              stroke={game.border}
              strokeWidth={1}
              strokeDasharray="3,3"
            />
          );
        }),
      )}
      {map.territories.map((t, i) => (
        <Circle
          key={t.id}
          cx={t.x}
          cy={t.y}
          r={6}
          fill={i % 3 === 0 ? game.primary : i % 3 === 1 ? game.gold : game.gem}
          stroke={game.text}
          strokeWidth={1.2}
          opacity={0.9}
        />
      ))}
    </Svg>
  );
}
