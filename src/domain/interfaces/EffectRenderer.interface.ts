import { ActionType } from "../types/action.types";
import { DeviceCapabilities } from "../types/device.types";
import { EffectType, Property } from "../types/effectTypes.types";

export interface IEffectRenderer {
  id: string;
  supportedTypes: EffectType[];
  capabilities: DeviceCapabilities[];
  handleCommand: (action: ActionType, properties: Property[]) => Promise<void>;
}
