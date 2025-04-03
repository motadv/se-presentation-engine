import {
  DeregisterDeviceResponse,
  RegisterDeviceRequest,
  RegisterDeviceResponse,
} from "./httpMessages.interface";

export interface IGingaApiService {
  registerDevice(
    request: RegisterDeviceRequest
  ): Promise<RegisterDeviceResponse>;
  updateDevice(
    handle: string,
    request: RegisterDeviceRequest
  ): Promise<Omit<RegisterDeviceResponse, "url">>;
  deregisterDevice(handle: string): Promise<DeregisterDeviceResponse>;
}
