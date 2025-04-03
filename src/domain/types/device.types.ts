import { EffectType } from "./effectTypes.types";

export type DeviceState =
  | "preparing"
  | "prepared"
  | "playing"
  | "stopped"
  | "idle";

export type DeviceCapabilities = {
  effectType: EffectType;
  state: DeviceState;
  locator?: string;
  preparationTime?: number;
};
