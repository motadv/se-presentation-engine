import { IDeviceRegistry } from "../../domain/interfaces/DeviceRegistry.interface";
import { IEffectRenderer } from "../../domain/interfaces/EffectRenderer.interface";
import { EffectType } from "../../domain/types/effectTypes.types";

export class DeviceRegistryImpl implements IDeviceRegistry {
  private devices: IEffectRenderer[] = [];

  register(device: IEffectRenderer): void {
    this.devices.push(device);
  }

  remove(deviceId: IEffectRenderer["id"]): void {
    this.devices.filter((device) => device.id !== deviceId);
  }

  clearRegistry(): void {
    this.devices = [];
  }

  getDevicesByType(type: EffectType): IEffectRenderer[] {
    return this.devices.filter((device) =>
      device.supportedTypes.includes(type)
    );
  }

  getAllDevices(): IEffectRenderer[] {
    return this.devices;
  }
}
