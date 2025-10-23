export type EffectType =
  | "LightType"
  | "TemperatureType"
  | "WindType"
  | "ScentType"
  | "VibrationType"
  | "SprayingType"
  | "FogType";


export type Color = [r: number, g: number, b: number] | string;

// Location types
type MPEGVX = "left" | "centerleft" | "center" | "centerright" | "right" | "*";
type MPEGVY = "bottom" | "middle" | "top" | "*";
type MPEGVZ = "back" | "midway" | "front" | "*";

export type MPEGV = `${MPEGVX}:${MPEGVY}:${MPEGVZ}`

export type Location = MPEGV

export type Property =
  | { name: "intensityValue"; value: number }
  | { name: "color"; value: Color }
  | { name: "scent"; value: string }
  | { name: "frequency"; value: number }
  | { name: "location"; value: Location };
