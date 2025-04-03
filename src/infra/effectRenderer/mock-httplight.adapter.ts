import { IEffectRenderer } from "../../domain/interfaces/EffectRenderer.interface";
import { DeviceCapabilities } from "../../domain/types/device.types";
import {
  ColorValue,
  EffectType,
  Property,
} from "../../domain/types/effectTypes.types";
import { v4 as uuidv4 } from "uuid";

export class HttpLightAdapter implements IEffectRenderer {
  id: string;
  supportedTypes: EffectType[] = [];
  capabilities: DeviceCapabilities[];

  constructor(private readonly url: string) {
    this.id = uuidv4();
    this.capabilities = [
      { effectType: "LightType", preparationTime: 0, state: "idle" },
    ];

    this.updateSupportedTypes();
  }

  private updateSupportedTypes() {
    const newSupportedTypes: EffectType[] = [];
    this.capabilities.forEach((capability) => {
      if (!newSupportedTypes.includes(capability.effectType))
        newSupportedTypes.push(capability.effectType);
    });

    this.supportedTypes = newSupportedTypes;
  }

  async handleCommand(action: string, properties: any[]): Promise<void> {
    // Decides which action to take based on the action type

    if (action === "start") {
      this.turnOn();
      this.setProperties(properties);
    } else if (action === "stop") {
      this.turnOff();
    }
    if (action === "set") {
      this.setProperties(properties);
    }
  }

  private async setProperties(properties: Property[]) {
    const brightness = properties.find((p) => p.name === "intensityValue");
    const color = properties.find((p) => p.name === "color");
    const frequency = properties.find((p) => p.name === "frequency");

    await Promise.all([
      brightness && this.setBrightness(brightness.value),
      color && this.setColor(color.value),
      frequency && this.setFrequency(frequency.value),
    ]);
  }

  private turnOn() {
    console.log(`Sending request to ${this.url}/on`);
  }

  private turnOff() {
    console.log(`Sending request to ${this.url}/off`);
  }

  private setBrightness(value: number) {
    console.log(`Setting brightness to ${value} at ${this.url}/brightness`);
  }

  private setColor(value: ColorValue) {
    console.log(`Setting color to ${value} at ${this.url}/color`);
  }

  private setFrequency(value: number) {
    console.log(`Setting frequency to ${value} at ${this.url}/frequency`);
  }
}
