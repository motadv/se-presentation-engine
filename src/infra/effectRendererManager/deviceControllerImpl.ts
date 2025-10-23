import { IDeviceController } from "../../domain/interfaces/DeviceController.interface";
import { IDeviceRegistry } from "../../domain/interfaces/DeviceRegistry.interface";
import { IEffectRenderer } from "../../domain/interfaces/EffectRenderer.interface";
import { DeviceCapabilities } from "../../domain/types/device.types";
import { EffectType, MPEGV } from "../../domain/types/effectTypes.types";
import { PresentationData } from "../../domain/types/rendererPresentationData.types";
import { Observable, Observer } from "../Pattern/ObserverController";

export class DeviceControllerImpl
  implements IDeviceController, Observable<EffectType[]>
{
  private observers = new Set<Observer<EffectType[]>>();

  constructor(private readonly deviceRegistry: IDeviceRegistry) {}

  async registerDevice(device: IEffectRenderer): Promise<void> {
    this.deviceRegistry.register(device);
  }

  async removeDevice(deviceId: IEffectRenderer["id"]): Promise<void> {
    this.deviceRegistry.remove(deviceId);
  }

  async handleData(data: PresentationData): Promise<void> {
    const dataLocation = data.properties?.find(
      (prop) => prop.name === "location"
    );

    let devices;

    if(dataLocation && typeof dataLocation.value === "string") {
      devices = this.deviceRegistry.getDeviceByTypeAndLocation(
        data.effectType,
        dataLocation.value
      )
    } else {
      devices = this.deviceRegistry.getDevicesByType(data.effectType);
    }

    devices.forEach(async (device) => {
      await device.handleCommand(data.action, data.properties || []);
    });
  }

  async clearRegistry(): Promise<void> {
    this.deviceRegistry.clearRegistry();
  }

  getSupportedTypes(): EffectType[] {
    const supportedTypes: Set<EffectType> = new Set();
    this.deviceRegistry.getAllDevices().forEach((device) => {
      device.supportedTypes.forEach((type) => {
        supportedTypes.add(type);
      });
    });

    return Array.from(supportedTypes);
  }

  getCapabilities(): DeviceCapabilities[] {
    const capabilities: DeviceCapabilities[] = [];
    this.deviceRegistry.getAllDevices().forEach((device) => {
      capabilities.push(...device.capabilities);
    });

    return capabilities;
  }

  subscribeObserver(observer: Observer<EffectType[]>): void {
    this.observers.add(observer);
  }

  unsubscribeObserver(observer: Observer<EffectType[]>): void {
    this.observers.delete(observer);
  }

  notifyObservers(): void {
    this.observers.forEach((observer) =>
      observer.update(this.getSupportedTypes())
    );
  }
}
