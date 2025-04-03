import { ActionType } from "./action.types";
import { EffectType, Property } from "./effectTypes.types";

export type PresentationData = {
  effectType: EffectType;
  action: ActionType;
  properties: Property[];
};
