export type Territory = {
  id: string;
  name: string;
  flag: string;
  x: number;
  y: number;
  isIsland?: boolean;
  adj: string[];
};

export type GameMap = {
  id: string;
  name: string;
  width: number;
  height: number;
  territories: Territory[];
};

// World map laid out on a 720 x 360 canvas (equirectangular-ish projection)
export const WORLD_MAP: GameMap = {
  id: "world",
  name: "Mundo",
  width: 720,
  height: 360,
  territories: [
    // Americas
    { id: "us", name: "EUA", flag: "🇺🇸", x: 140, y: 120, adj: ["br", "uk"] },
    { id: "br", name: "Brasil", flag: "🇧🇷", x: 220, y: 240, adj: ["us", "za"] },

    // Europe
    { id: "uk", name: "Reino Unido", flag: "🇬🇧", x: 330, y: 110, isIsland: true, adj: ["us", "fr", "ru"] },
    { id: "fr", name: "França", flag: "🇫🇷", x: 360, y: 145, adj: ["uk", "eg", "ru"] },
    { id: "ru", name: "Rússia", flag: "🇷🇺", x: 470, y: 95, adj: ["uk", "fr", "cn", "in"] },

    // Africa
    { id: "eg", name: "Egito", flag: "🇪🇬", x: 410, y: 195, adj: ["fr", "za", "in"] },
    { id: "za", name: "África do Sul", flag: "🇿🇦", x: 410, y: 290, adj: ["eg", "br", "mg"] },
    { id: "mg", name: "Madagascar", flag: "🇲🇬", x: 470, y: 280, isIsland: true, adj: ["za"] },

    // Asia
    { id: "in", name: "Índia", flag: "🇮🇳", x: 520, y: 200, adj: ["ru", "eg", "cn"] },
    { id: "cn", name: "China", flag: "🇨🇳", x: 560, y: 160, adj: ["ru", "in", "jp", "id"] },
    { id: "jp", name: "Japão", flag: "🇯🇵", x: 635, y: 140, isIsland: true, adj: ["cn"] },
    { id: "id", name: "Indonésia", flag: "🇮🇩", x: 590, y: 245, isIsland: true, adj: ["cn", "au"] },

    // Oceania
    { id: "au", name: "Austrália", flag: "🇦🇺", x: 620, y: 295, adj: ["id"] },
  ],
};

export function getMap(): GameMap {
  return WORLD_MAP;
}

export function distance(a: Territory, b: Territory): number {
  const dx = a.x - b.x;
  const dy = a.y - b.y;
  return Math.sqrt(dx * dx + dy * dy);
}

export const ADJACENT_DIST = 80;
