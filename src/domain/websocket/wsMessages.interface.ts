import { EffectType } from "../types/effectTypes.types";
import { PresentationData } from "../types/rendererPresentationData.types";
import { SepeCapability } from "../types/sepe.types";

interface DeviceCapabilitiesRequest {
  type?: EffectType;
  capabilities: Omit<SepeCapability, "value">[];
}

interface DeviceCapabilitiesResponse {
  type?: EffectType;
  capabilities: SepeCapability[];
}

interface ControlEffectRendererRequest extends PresentationData {}

interface ControlEffectRendererResponse extends DeviceCapabilitiesResponse {}

type WsRequestMessage =
  | DeviceCapabilitiesRequest
  | ControlEffectRendererRequest;
type WsResponseMessage =
  | DeviceCapabilitiesResponse
  | ControlEffectRendererResponse;

export { WsRequestMessage, WsResponseMessage };
