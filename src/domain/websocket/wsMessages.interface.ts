import { DeviceCapabilities } from "../types/device.types";
import { EffectType } from "../types/effectTypes.types";
import { PresentationData } from "../types/rendererPresentationData.types";

interface DeviceCapabilitiesRequest {
  type?: EffectType;
  capabilities: keyof DeviceCapabilities[];
}

interface DeviceCapabilitiesResponse {
  type?: EffectType;
  capabilities: DeviceCapabilities[];
}

interface ControlEffectRendererRequest extends PresentationData {}

interface ControlEffectRendererResponse extends PresentationData {
  status: "success" | "error";
  error?: string;
}

type WsRequestMessage =
  | DeviceCapabilitiesRequest
  | ControlEffectRendererRequest;
type WsResponseMessage =
  | DeviceCapabilitiesResponse
  | ControlEffectRendererResponse;

export { WsRequestMessage, WsResponseMessage };
