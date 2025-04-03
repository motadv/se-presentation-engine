import { DeviceCapabilities } from "../types/device.types";
import { EffectType } from "../types/effectTypes.types";
import { PresentationData } from "../types/rendererPresentationData.types";
import { IEffectRenderer } from "./EffectRenderer.interface";

export interface IDeviceController {
  registerDevice(device: IEffectRenderer): void;
  removeDevice(deviceId: IEffectRenderer["id"]): void;
  handleData(data: PresentationData): void;
  clearRegistry(): void;
  getSupportedTypes(): EffectType[];
  getCapabilities(): DeviceCapabilities[];
}
