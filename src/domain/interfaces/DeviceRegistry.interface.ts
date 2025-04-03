import { IEffectRenderer } from "./EffectRenderer.interface";

export interface IDeviceRegistry {
  register(device: IEffectRenderer): void;
  remove(deviceId: IEffectRenderer["id"]): void;
  clearRegistry(): void;
  getDevicesByType(type: string): IEffectRenderer[];
  getAllDevices(): IEffectRenderer[];
}
