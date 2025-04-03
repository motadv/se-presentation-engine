import { DeviceState } from "./device.types";
import { EffectType } from "./effectTypes.types";

export type SepeCapability =
  | {
      name: "effectType";
      value: EffectType[];
    }
  | {
      name: "locator";
      value: string;
    }
  | {
      name: "preparationTime";
      value: number;
    }
  | {
      name: "state";
      value: DeviceState;
    };
