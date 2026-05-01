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

// Portrait world map — 360 × 720 virtual canvas
export const WORLD_MAP: GameMap = {
  id: "world",
  name: "Mundo",
  width: 360,
  height: 720,
  territories: [
    { id: "us", name: "EUA",          flag: "🇺🇸", x: 85,  y: 215, adj: ["br", "uk"] },
    { id: "br", name: "Brasil",       flag: "🇧🇷", x: 100, y: 440, adj: ["us", "za"] },
    { id: "uk", name: "Reino Unido",  flag: "🇬🇧", x: 210, y: 135, isIsland: true, adj: ["us", "fr", "ru"] },
    { id: "fr", name: "França",       flag: "🇫🇷", x: 230, y: 195, adj: ["uk", "eg"] },
    { id: "ru", name: "Rússia",       flag: "🇷🇺", x: 285, y: 130, adj: ["uk", "cn"] },
    { id: "eg", name: "Egito",        flag: "🇪🇬", x: 248, y: 305, adj: ["fr", "za", "in"] },
    { id: "za", name: "África do Sul",flag: "🇿🇦", x: 235, y: 465, adj: ["eg", "br"] },
    { id: "in", name: "Índia",        flag: "🇮🇳", x: 293, y: 330, adj: ["eg", "cn"] },
    { id: "cn", name: "China",        flag: "🇨🇳", x: 300, y: 230, adj: ["ru", "in", "jp", "au"] },
    { id: "jp", name: "Japão",        flag: "🇯🇵", x: 340, y: 198, isIsland: true, adj: ["cn"] },
    { id: "au", name: "Austrália",    flag: "🇦🇺", x: 320, y: 535, isIsland: true, adj: ["cn"] },
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

export const ADJACENT_DIST = 105;
