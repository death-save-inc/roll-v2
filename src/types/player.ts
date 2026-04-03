export interface Player {
  id: string; // corresponds to ThreeJS 'uuid'
  name: string;
  modifier: number;
  imgUrl: string; // corresponds to ThreeJS 'imageSrc'
  roll: number;
  reroll?: number | null;
  type: "player" | "dm";
}
