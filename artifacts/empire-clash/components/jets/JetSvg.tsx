import React from "react";
import Svg, { Path, G, Ellipse, Rect, Circle } from "react-native-svg";

export type JetModel =
  | "F15"
  | "F16"
  | "F22"
  | "SU57"
  | "Rafale"
  | "Gripen";

type Props = {
  model: JetModel;
  color?: string;
  size?: number;
};

function F15({ color, size }: { color: string; size: number }) {
  return (
    <Svg viewBox="0 0 100 115" width={size} height={size}>
      <G opacity={0.95}>
        {/* Fuselage - wide twin-engine body */}
        <Path
          d="M50 2 L55 18 L58 52 L57 70 L53 80 L50 83 L47 80 L43 70 L42 52 L45 18 Z"
          fill={color}
        />
        {/* Left main wing - large swept delta */}
        <Path
          d="M45 24 L4 60 L8 67 L44 55 Z"
          fill={color}
        />
        {/* Right main wing */}
        <Path
          d="M55 24 L96 60 L92 67 L56 55 Z"
          fill={color}
        />
        {/* Left horizontal stabilizer */}
        <Path
          d="M43 68 L26 82 L43 76 Z"
          fill={color}
          opacity={0.88}
        />
        {/* Right horizontal stabilizer */}
        <Path
          d="M57 68 L74 82 L57 76 Z"
          fill={color}
          opacity={0.88}
        />
        {/* Twin engine nozzles */}
        <Ellipse cx={45} cy={85} rx={3.5} ry={5} fill={color} opacity={0.7} />
        <Ellipse cx={55} cy={85} rx={3.5} ry={5} fill={color} opacity={0.7} />
        {/* Cockpit highlight */}
        <Ellipse cx={50} cy={20} rx={2.5} ry={5} fill={color} opacity={0.5} />
      </G>
    </Svg>
  );
}

function F16({ color, size }: { color: string; size: number }) {
  return (
    <Svg viewBox="0 0 100 115" width={size} height={size}>
      <G opacity={0.95}>
        {/* Slender fuselage */}
        <Path
          d="M50 3 L54 20 L56 72 L52 85 L50 88 L48 85 L44 72 L46 20 Z"
          fill={color}
        />
        {/* Left wing - blended delta */}
        <Path
          d="M46 26 L6 70 L10 76 L45 62 Z"
          fill={color}
        />
        {/* Right wing */}
        <Path
          d="M54 26 L94 70 L90 76 L55 62 Z"
          fill={color}
        />
        {/* Left small stabilizer */}
        <Path
          d="M44 72 L30 84 L44 79 Z"
          fill={color}
          opacity={0.85}
        />
        {/* Right small stabilizer */}
        <Path
          d="M56 72 L70 84 L56 79 Z"
          fill={color}
          opacity={0.85}
        />
        {/* Single engine nozzle */}
        <Ellipse cx={50} cy={90} rx={4} ry={5.5} fill={color} opacity={0.7} />
        {/* Air intake below fuselage (visible as oval) */}
        <Ellipse cx={50} cy={48} rx={4} ry={7} fill={color} opacity={0.45} />
        {/* Cockpit */}
        <Ellipse cx={50} cy={19} rx={2.2} ry={5} fill={color} opacity={0.5} />
      </G>
    </Svg>
  );
}

function F22({ color, size }: { color: string; size: number }) {
  return (
    <Svg viewBox="0 0 100 115" width={size} height={size}>
      <G opacity={0.95}>
        {/* Wide angular fuselage */}
        <Path
          d="M50 3 L57 16 L62 55 L60 74 L55 82 L50 85 L45 82 L40 74 L38 55 L43 16 Z"
          fill={color}
        />
        {/* Left trapezoidal wing */}
        <Path
          d="M43 16 L5 52 L10 64 L42 56 Z"
          fill={color}
        />
        {/* Right trapezoidal wing */}
        <Path
          d="M57 16 L95 52 L90 64 L58 56 Z"
          fill={color}
        />
        {/* Left canted stabilizer */}
        <Path
          d="M41 70 L24 84 L41 79 Z"
          fill={color}
          opacity={0.88}
        />
        {/* Right canted stabilizer */}
        <Path
          d="M59 70 L76 84 L59 79 Z"
          fill={color}
          opacity={0.88}
        />
        {/* Twin engine nozzles */}
        <Ellipse cx={45} cy={86} rx={3.5} ry={4.5} fill={color} opacity={0.7} />
        <Ellipse cx={55} cy={86} rx={3.5} ry={4.5} fill={color} opacity={0.7} />
        {/* Stealth cockpit */}
        <Ellipse cx={50} cy={18} rx={3} ry={5.5} fill={color} opacity={0.45} />
      </G>
    </Svg>
  );
}

function SU57({ color, size }: { color: string; size: number }) {
  return (
    <Svg viewBox="0 0 100 115" width={size} height={size}>
      <G opacity={0.95}>
        {/* Fuselage with wide LERX */}
        <Path
          d="M50 3 L55 20 L58 60 L56 76 L52 83 L50 86 L48 83 L44 76 L42 60 L45 20 Z"
          fill={color}
        />
        {/* Left canard */}
        <Path
          d="M45 22 L20 38 L43 35 Z"
          fill={color}
          opacity={0.9}
        />
        {/* Right canard */}
        <Path
          d="M55 22 L80 38 L57 35 Z"
          fill={color}
          opacity={0.9}
        />
        {/* Left main delta wing */}
        <Path
          d="M43 38 L5 72 L10 78 L43 65 Z"
          fill={color}
        />
        {/* Right main delta wing */}
        <Path
          d="M57 38 L95 72 L90 78 L57 65 Z"
          fill={color}
        />
        {/* Left twin tail */}
        <Path
          d="M44 74 L34 87 L44 81 Z"
          fill={color}
          opacity={0.85}
        />
        {/* Right twin tail */}
        <Path
          d="M56 74 L66 87 L56 81 Z"
          fill={color}
          opacity={0.85}
        />
        {/* Twin nozzles */}
        <Ellipse cx={45} cy={88} rx={3.2} ry={4.5} fill={color} opacity={0.7} />
        <Ellipse cx={55} cy={88} rx={3.2} ry={4.5} fill={color} opacity={0.7} />
        {/* Cockpit */}
        <Ellipse cx={50} cy={20} rx={2.5} ry={5} fill={color} opacity={0.5} />
      </G>
    </Svg>
  );
}

function Rafale({ color, size }: { color: string; size: number }) {
  return (
    <Svg viewBox="0 0 100 115" width={size} height={size}>
      <G opacity={0.95}>
        {/* Compact fuselage */}
        <Path
          d="M50 5 L54 22 L56 68 L52 80 L50 83 L48 80 L44 68 L46 22 Z"
          fill={color}
        />
        {/* Left canard - prominent */}
        <Path
          d="M45 25 L22 42 L44 38 Z"
          fill={color}
          opacity={0.92}
        />
        {/* Right canard */}
        <Path
          d="M55 25 L78 42 L56 38 Z"
          fill={color}
          opacity={0.92}
        />
        {/* Left delta wing */}
        <Path
          d="M44 40 L6 75 L10 80 L44 68 Z"
          fill={color}
        />
        {/* Right delta wing */}
        <Path
          d="M56 40 L94 75 L90 80 L56 68 Z"
          fill={color}
        />
        {/* Single engine nozzle */}
        <Ellipse cx={50} cy={85} rx={4} ry={5} fill={color} opacity={0.7} />
        {/* Cockpit */}
        <Ellipse cx={50} cy={22} rx={2.2} ry={4.5} fill={color} opacity={0.5} />
      </G>
    </Svg>
  );
}

function Gripen({ color, size }: { color: string; size: number }) {
  return (
    <Svg viewBox="0 0 100 115" width={size} height={size}>
      <G opacity={0.95}>
        {/* Compact fuselage */}
        <Path
          d="M50 8 L54 24 L55 66 L51 77 L50 80 L49 77 L45 66 L46 24 Z"
          fill={color}
        />
        {/* Left canard - large relative to size */}
        <Path
          d="M45 27 L18 44 L44 40 Z"
          fill={color}
          opacity={0.92}
        />
        {/* Right canard */}
        <Path
          d="M55 27 L82 44 L56 40 Z"
          fill={color}
          opacity={0.92}
        />
        {/* Left delta wing - compact */}
        <Path
          d="M44 42 L10 73 L14 78 L44 67 Z"
          fill={color}
        />
        {/* Right delta wing */}
        <Path
          d="M56 42 L90 73 L86 78 L56 67 Z"
          fill={color}
        />
        {/* Compact single nozzle */}
        <Ellipse cx={50} cy={82} rx={3.5} ry={4.5} fill={color} opacity={0.7} />
        {/* Cockpit */}
        <Ellipse cx={50} cy={24} rx={2} ry={4} fill={color} opacity={0.5} />
      </G>
    </Svg>
  );
}

export function JetSvg({ model, color = "#FFFFFF", size = 80 }: Props) {
  switch (model) {
    case "F15":    return <F15 color={color} size={size} />;
    case "F16":    return <F16 color={color} size={size} />;
    case "F22":    return <F22 color={color} size={size} />;
    case "SU57":   return <SU57 color={color} size={size} />;
    case "Rafale": return <Rafale color={color} size={size} />;
    case "Gripen": return <Gripen color={color} size={size} />;
  }
}
