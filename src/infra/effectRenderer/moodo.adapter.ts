import { IEffectRenderer } from "../../domain/interfaces/EffectRenderer.interface";
import { ActionType } from "../../domain/types/action.types";
import {
  DeviceCapabilities,
  DeviceState,
} from "../../domain/types/device.types";
import { EffectType, Property } from "../../domain/types/effectTypes.types";
import { v4 as uuidv4 } from "uuid";

// Types for the Moodo API responses
type MoodoLoginResponse = {
  token: string;
};

type MoodoBox = {
  id: string; // This is the key used in the route /boxes/{id}
  device_key: number;
  name: string;
  // Other fields from the API...
};

type GetBoxesResponse = {
  boxes: MoodoBox[];
};

export class MoodoAdapter implements IEffectRenderer {
  id: string;
  supportedTypes: EffectType[] = ["ScentType"];
  capabilities: DeviceCapabilities[];

  private baseUrl: string = "https://rest.moodo.co/api";
  private apiToken: string | null = null;
  private deviceKey: number | null = null; // This will store the box 'id'
  private deviceState: DeviceState = "idle";

  constructor(email: string, password: string) {
    this.id = uuidv4();
    this.capabilities = [
      {
        effectType: "ScentType",
        state: this.deviceState,
        locator: `moodo://${this.id}`,
        preparationTime: 5000, // 5 seconds to prepare
      },
    ];

    this.initialize(email, password);
  }

  /**
   * Orchestrates the 2-step initialization: login, then fetch device info.
   */
  private async initialize(email: string, password: string) {
    this.deviceState = "preparing";
    this.updateCapabilitiesState();

    try {
      // Step 1: Authenticate to get the token
      const token = await this.authenticate(email, password);
      if (!token) {
        throw new Error("Authentication failed, could not retrieve token.");
      }
      this.apiToken = token;
      console.log("[Moodo] Authentication successful.");

      // Step 2: Use the token to fetch the device key
      const deviceKey = await this.fetchDeviceKey();
      if (!deviceKey) {
        throw new Error("Could not find any associated Moodo box.");
      }
      this.deviceKey = deviceKey;
      console.log(`[Moodo] Device found with Key: ${this.deviceKey}`);

      this.deviceState = "prepared";
      this.updateCapabilitiesState();
    } catch (error) {
      console.error("[Moodo] Initialization failed:", error);
      this.deviceState = "idle";
      this.updateCapabilitiesState();
    }
  }

  /**
   * Authenticates and returns the session token.
   */
  private async authenticate(
    email: string,
    password: string
  ): Promise<string | null> {
    try {
      const response = await fetch(`${this.baseUrl}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      if (!response.ok) throw new Error(`Login failed: ${response.status}`);
      const data: MoodoLoginResponse = await response.json();
      return data.token;
    } catch (error) {
      console.error("[Moodo] Authentication error:", error);
      return null;
    }
  }

  /**
   * Fetches the list of boxes and returns the ID of the first one.
   */
  private async fetchDeviceKey(): Promise<number | null> {
    if (!this.apiToken) {
      console.error("[Moodo] Cannot fetch devices without API token.");
      return null;
    }
    try {
      const response = await fetch(`${this.baseUrl}/boxes`, {
        method: "GET",
        headers: { token: this.apiToken },
      });
      if (!response.ok) throw new Error(`Fetching boxes failed: ${response.status}`);
      const data: GetBoxesResponse = await response.json();
      return data.boxes?.[0]?.device_key ?? null;
    } catch (error) {
      console.error("[Moodo] Error fetching device key:", error);
      return null;
    }
  }

  private updateCapabilitiesState() {
    this.capabilities[0].state = this.deviceState;
  }

  async handleCommand(
    action: ActionType,
    properties: Property[]
  ): Promise<void> {
    if (this.deviceState !== "prepared" && this.deviceState !== "playing" && this.deviceState !== "stopped") {
      console.error(`[Moodo] Adapter not ready. State: ${this.deviceState}`);
      return;
    }

    let intensity = 0;
    switch (action) {
      case "start":
      case "set":
        const intensityProp = properties.find(p => p.name === "intensityValue");
        intensity = (intensityProp?.value as number) ?? 50;
        this.deviceState = "playing";
        break;
      case "stop":
        intensity = 0;
        this.deviceState = "stopped";
        break;
      default:
        console.warn(`[Moodo] Action '${action}' not supported.`);
        return;
    }
    await this.setFanVolume(intensity);
    this.updateCapabilitiesState();
  }

  private async setFanVolume(intensity: number) {
    if (!this.deviceKey || !this.apiToken) return;

    const clampedIntensity = Math.max(0, Math.min(100, intensity));
    const body = {
      fan_volume: clampedIntensity,
      duration_minutes: 1,
      favorite_id: "",
      restful_request_id: uuidv4(),
    };

    try {
      console.log(`[Moodo] Sending command: Set fan_volume to ${clampedIntensity} at `, Date.now());
      const response = await fetch(`${this.baseUrl}/boxes/${this.deviceKey}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          token: this.apiToken,
        },
        body: JSON.stringify(body),
      });
      if (!response.ok) throw new Error(`API returned status: ${response.status}`);
      console.log("[Moodo] Command sent successfully at ", Date.now());
    } catch (error) {
      console.error("[Moodo] Failed to set fan volume:", error);
    }
  }
}