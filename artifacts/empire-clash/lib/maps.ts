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
    // North America
    { id: "us", name: "EUA", flag: "🇺🇸", x: 130, y: 130, adj: ["ca", "mx", "cu"] },
    { id: "ca", name: "Canadá", flag: "🇨🇦", x: 140, y: 75, adj: ["us", "gl"] },
    { id: "mx", name: "México", flag: "🇲🇽", x: 130, y: 175, adj: ["us", "co", "cu"] },
    { id: "gl", name: "Groenlândia", flag: "🇬🇱", x: 245, y: 50, isIsland: true, adj: ["ca", "uk"] },
    { id: "cu", name: "Cuba", flag: "🇨🇺", x: 175, y: 170, isIsland: true, adj: ["us", "mx", "co"] },
    { id: "hi", name: "Havaí", flag: "🇺🇸", x: 50, y: 175, isIsland: true, adj: [] },

    // South America
    { id: "co", name: "Colômbia", flag: "🇨🇴", x: 175, y: 215, adj: ["mx", "br", "pe"] },
    { id: "br", name: "Brasil", flag: "🇧🇷", x: 220, y: 250, adj: ["co", "pe", "ar"] },
    { id: "pe", name: "Peru", flag: "🇵🇪", x: 175, y: 260, adj: ["co", "br", "ar"] },
    { id: "ar", name: "Argentina", flag: "🇦🇷", x: 195, y: 305, adj: ["br", "pe"] },

    // Europe
    { id: "uk", name: "Reino Unido", flag: "🇬🇧", x: 320, y: 105, isIsland: true, adj: ["gl", "fr", "se"] },
    { id: "fr", name: "França", flag: "🇫🇷", x: 340, y: 130, adj: ["uk", "es", "de", "it"] },
    { id: "es", name: "Espanha", flag: "🇪🇸", x: 320, y: 150, adj: ["fr", "ma", "it"] },
    { id: "de", name: "Alemanha", flag: "🇩🇪", x: 365, y: 110, adj: ["fr", "uk", "se", "it", "ru"] },
    { id: "it", name: "Itália", flag: "🇮🇹", x: 365, y: 150, adj: ["fr", "es", "de", "tr"] },
    { id: "se", name: "Suécia", flag: "🇸🇪", x: 380, y: 75, adj: ["uk", "de", "ru"] },
    { id: "ru", name: "Rússia", flag: "🇷🇺", x: 470, y: 90, adj: ["se", "de", "tr", "cn", "kr"] },
    { id: "tr", name: "Turquia", flag: "🇹🇷", x: 410, y: 150, adj: ["it", "ru", "sa", "eg"] },

    // Africa
    { id: "ma", name: "Marrocos", flag: "🇲🇦", x: 335, y: 180, adj: ["es", "ng", "eg"] },
    { id: "eg", name: "Egito", flag: "🇪🇬", x: 410, y: 185, adj: ["tr", "ma", "ng", "sa"] },
    { id: "ng", name: "Nigéria", flag: "🇳🇬", x: 365, y: 230, adj: ["ma", "eg", "za"] },
    { id: "za", name: "África do Sul", flag: "🇿🇦", x: 400, y: 295, adj: ["ng", "mg"] },
    { id: "mg", name: "Madagascar", flag: "🇲🇬", x: 460, y: 285, isIsland: true, adj: ["za"] },

    // Middle East
    { id: "sa", name: "Arábia Saudita", flag: "🇸🇦", x: 450, y: 195, adj: ["tr", "eg", "in"] },

    // Asia
    { id: "in", name: "Índia", flag: "🇮🇳", x: 510, y: 200, adj: ["sa", "cn", "id"] },
    { id: "cn", name: "China", flag: "🇨🇳", x: 555, y: 160, adj: ["ru", "in", "kr", "jp", "id", "ph"] },
    { id: "kr", name: "Coreia", flag: "🇰🇷", x: 605, y: 145, adj: ["cn", "ru", "jp"] },
    { id: "jp", name: "Japão", flag: "🇯🇵", x: 635, y: 140, isIsland: true, adj: ["kr", "cn", "ph"] },
    { id: "id", name: "Indonésia", flag: "🇮🇩", x: 590, y: 245, isIsland: true, adj: ["in", "cn", "ph", "au"] },
    { id: "ph", name: "Filipinas", flag: "🇵🇭", x: 615, y: 215, isIsland: true, adj: ["cn", "jp", "id"] },

    // Oceania
    { id: "au", name: "Austrália", flag: "🇦🇺", x: 615, y: 295, adj: ["id", "nz"] },
    { id: "nz", name: "Nova Zelândia", flag: "🇳🇿", x: 670, y: 320, isIsland: true, adj: ["au"] },
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
