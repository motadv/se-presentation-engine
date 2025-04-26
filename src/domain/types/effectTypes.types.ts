export type EffectType =
  | "LightType"
  | "TemperatureType"
  | "WindType"
  | "ScentType"
  | "VibrationType"
  | "SprayingType"
  | "FogType";

export type ColorValue = [r: number, g: number, b: number] | string;

export type Property =
  | { name: "intensityValue"; value: number }
  | { name: "color"; value: ColorValue }
  | { name: "scent"; value: string }
  | { name: "frequency"; value: number };
