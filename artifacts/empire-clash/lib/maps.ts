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
    { id: "us", name: "EUA", flag: "🇺🇸", x: 150, y: 130, adj: ["br", "uk"] },
    { id: "br", name: "Brasil", flag: "🇧🇷", x: 230, y: 250, adj: ["us", "za"] },
    { id: "uk", name: "Reino Unido", flag: "🇬🇧", x: 340, y: 115, isIsland: true, adj: ["us", "fr", "ru"] },
    { id: "fr", name: "França", flag: "🇫🇷", x: 365, y: 155, adj: ["uk", "eg"] },
    { id: "ru", name: "Rússia", flag: "🇷🇺", x: 470, y: 100, adj: ["uk", "cn"] },
    { id: "eg", name: "Egito", flag: "🇪🇬", x: 415, y: 200, adj: ["fr", "za", "in"] },
    { id: "za", name: "África do Sul", flag: "🇿🇦", x: 410, y: 290, adj: ["eg", "br"] },
    { id: "in", name: "Índia", flag: "🇮🇳", x: 520, y: 205, adj: ["eg", "cn"] },
    { id: "cn", name: "China", flag: "🇨🇳", x: 565, y: 160, adj: ["ru", "in", "jp", "au"] },
    { id: "jp", name: "Japão", flag: "🇯🇵", x: 635, y: 140, isIsland: true, adj: ["cn"] },
    { id: "au", name: "Austrália", flag: "🇦🇺", x: 620, y: 295, isIsland: true, adj: ["cn"] },
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
