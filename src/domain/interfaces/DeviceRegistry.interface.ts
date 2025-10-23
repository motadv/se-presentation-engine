import { EffectType, MPEGV } from "../types/effectTypes.types";
import { IEffectRenderer } from "./EffectRenderer.interface";

export interface IDeviceRegistry {
  register(device: IEffectRenderer): void;
  remove(deviceId: IEffectRenderer["id"]): void;
  clearRegistry(): void;
  getDevicesByType(type: EffectType): IEffectRenderer[];
  getDeviceByTypeAndLocation(targetType: EffectType, targetLocation: MPEGV): IEffectRenderer[]
  getAllDevices(): IEffectRenderer[];
}
