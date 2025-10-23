import WebSocket from "ws";
import { EffectType } from "../../domain/types/effectTypes.types";
import { DeviceCapabilities } from "../../domain/types/device.types";
import { v4 as uuidv4 } from "uuid";

import { IEffectRenderer } from "../../domain/interfaces/EffectRenderer.interface";

export class WebSocketLightAdapter implements IEffectRenderer {
  private socket: WebSocket;
  id: string;
  supportedTypes: EffectType[] = [];
  capabilities: DeviceCapabilities[];

  constructor(private readonly wsUrl: string) {
    this.id = uuidv4();
    this.capabilities = [
      { effectType: "LightType", preparationTime: 0, state: "idle" },
    ];

    this.updateSupportedTypes();

    this.socket = new WebSocket(wsUrl);
    this.setupConnection();
  }

  private setupConnection() {
    this.socket.on("open", () => {
      console.log("Connected to WebSocket server");
    });
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
    } else if (action === "stop") {
      this.turnOff();
    }
    if (action === "set") {
      const brightness = properties.find((p) => p.name === "intensityValue");
      const color = properties.find((p) => p.name === "color");
      const frequency = properties.find((p) => p.name === "frequency");

      await Promise.all([
        brightness && this.setBrightness(brightness.value),
        color && this.setColor(color.value),
        frequency && this.setFrequency(frequency.value),
      ]);
    }
  }

  // Handle what to communicate to the device based on the action
  // These methods are private because they are only used internally

  private async turnOn(): Promise<void> {
    this.socket.send(JSON.stringify({ action: "start" }));
  }

  private async turnOff(): Promise<void> {
    this.socket.send(JSON.stringify({ action: "stop" }));
  }

  private async setBrightness(brightness: number): Promise<void> {
    this.socket.send(JSON.stringify({ action: "set", brightness }));
  }

  private async setColor(color: string): Promise<void> {
    this.socket.send(JSON.stringify({ action: "set", color }));
  }

  private async setFrequency(frequency: number): Promise<void> {
    this.socket.send(JSON.stringify({ action: "set", frequency }));
  }
}
