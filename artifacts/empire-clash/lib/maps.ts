export type Territory = {
  id: string;
  name: string;
  x: number;
  y: number;
  adj: string[];
};

export type GameMap = {
  id: string;
  name: string;
  flag: string;
  width: number;
  height: number;
  territories: Territory[];
  unlocked: boolean;
};

export const MAPS: GameMap[] = [
  {
    id: "usa",
    name: "Estados Unidos",
    flag: "US",
    width: 360,
    height: 240,
    unlocked: true,
    territories: [
      { id: "ca", name: "California", x: 50, y: 130, adj: ["nv", "az"] },
      { id: "nv", name: "Nevada", x: 80, y: 110, adj: ["ca", "az", "co"] },
      { id: "az", name: "Arizona", x: 95, y: 165, adj: ["ca", "nv", "tx"] },
      { id: "co", name: "Colorado", x: 130, y: 110, adj: ["nv", "tx", "il"] },
      { id: "tx", name: "Texas", x: 165, y: 185, adj: ["az", "co", "fl"] },
      { id: "il", name: "Illinois", x: 200, y: 90, adj: ["co", "ny", "fl"] },
      { id: "fl", name: "Florida", x: 245, y: 195, adj: ["tx", "il", "ny"] },
      { id: "ny", name: "New York", x: 280, y: 80, adj: ["il", "fl"] },
    ],
  },
  {
    id: "br",
    name: "Brasil",
    flag: "BR",
    width: 360,
    height: 240,
    unlocked: true,
    territories: [
      { id: "am", name: "Amazonas", x: 90, y: 80, adj: ["pa", "mt"] },
      { id: "pa", name: "Pará", x: 165, y: 75, adj: ["am", "ma", "mt"] },
      { id: "ma", name: "Maranhão", x: 220, y: 80, adj: ["pa", "ce", "ba"] },
      { id: "ce", name: "Ceará", x: 270, y: 70, adj: ["ma", "ba"] },
      { id: "mt", name: "Mato Grosso", x: 130, y: 140, adj: ["am", "pa", "go"] },
      { id: "go", name: "Goiás", x: 180, y: 145, adj: ["mt", "ba", "sp"] },
      { id: "ba", name: "Bahia", x: 240, y: 140, adj: ["ma", "ce", "go", "mg"] },
      { id: "mg", name: "Minas Gerais", x: 220, y: 185, adj: ["ba", "sp", "rj"] },
      { id: "sp", name: "São Paulo", x: 175, y: 200, adj: ["go", "mg", "rs"] },
      { id: "rj", name: "Rio de Janeiro", x: 250, y: 200, adj: ["mg"] },
      { id: "rs", name: "Rio Grande", x: 145, y: 220, adj: ["sp"] },
    ],
  },
  {
    id: "eu",
    name: "Europa",
    flag: "EU",
    width: 360,
    height: 240,
    unlocked: false,
    territories: [
      { id: "uk", name: "Reino Unido", x: 80, y: 70, adj: ["fr", "de"] },
      { id: "fr", name: "França", x: 110, y: 130, adj: ["uk", "de", "es", "it"] },
      { id: "es", name: "Espanha", x: 75, y: 175, adj: ["fr", "it"] },
      { id: "de", name: "Alemanha", x: 165, y: 100, adj: ["uk", "fr", "pl", "it"] },
      { id: "it", name: "Itália", x: 165, y: 165, adj: ["fr", "es", "de", "gr"] },
      { id: "pl", name: "Polônia", x: 215, y: 95, adj: ["de", "ua", "ro"] },
      { id: "ua", name: "Ucrânia", x: 275, y: 100, adj: ["pl", "ro", "ru"] },
      { id: "ro", name: "Romênia", x: 240, y: 145, adj: ["pl", "ua", "gr"] },
      { id: "gr", name: "Grécia", x: 215, y: 195, adj: ["it", "ro"] },
      { id: "ru", name: "Rússia", x: 320, y: 80, adj: ["ua"] },
    ],
  },
  {
    id: "world",
    name: "Mundo",
    flag: "WW",
    width: 360,
    height: 240,
    unlocked: false,
    territories: [
      { id: "na", name: "América do N.", x: 65, y: 90, adj: ["sa", "eu"] },
      { id: "sa", name: "América do S.", x: 100, y: 180, adj: ["na", "af"] },
      { id: "eu", name: "Europa", x: 175, y: 80, adj: ["na", "af", "as", "me"] },
      { id: "af", name: "África", x: 180, y: 170, adj: ["sa", "eu", "me"] },
      { id: "me", name: "Oriente Médio", x: 220, y: 130, adj: ["eu", "af", "as"] },
      { id: "as", name: "Ásia", x: 280, y: 90, adj: ["eu", "me", "oc"] },
      { id: "oc", name: "Oceania", x: 310, y: 195, adj: ["as"] },
    ],
  },
  {
    id: "neo",
    name: "Neo Tokyo 2099",
    flag: "FT",
    width: 360,
    height: 240,
    unlocked: false,
    territories: [
      { id: "n1", name: "Setor Alpha", x: 70, y: 80, adj: ["n2", "n3"] },
      { id: "n2", name: "Setor Beta", x: 160, y: 60, adj: ["n1", "n4"] },
      { id: "n3", name: "Setor Gamma", x: 90, y: 170, adj: ["n1", "n5"] },
      { id: "n4", name: "Setor Delta", x: 250, y: 90, adj: ["n2", "n6"] },
      { id: "n5", name: "Setor Eta", x: 180, y: 180, adj: ["n3", "n4", "n6"] },
      { id: "n6", name: "Núcleo", x: 290, y: 180, adj: ["n4", "n5"] },
    ],
  },
];

export function getMap(id: string): GameMap {
  return MAPS.find((m) => m.id === id) ?? MAPS[0]!;
}
