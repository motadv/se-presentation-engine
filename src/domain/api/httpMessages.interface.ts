import { EffectType } from "../types/effectTypes.types";

// Define the request body structure
export interface RegisterDeviceRequest {
  deviceClass: "sensory-effect";
  supportedTypes: EffectType[];
}

// Define the response structure
export interface RegisterDeviceResponse {
  handle: string;
  url: string;
}

export interface DeregisterDeviceResponse {}

// Define error codes
export enum ApiErrorCode {
  ApiNotFound = 100,
  IllegalArgument = 101,
  UnauthorizedByUser = 102,
  UnableToAskAuthorization = 103,
  UnauthorizedByBroadcaster = 104,
  MissingArgument = 105,
  ApiUnavailableOnRuntimeEnv = 106,
  InvalidAccessToken = 107,
  InvalidBindToken = 108,
  ResourceUnavailable = 200,
  FormatNotSupported = 201,
  ActionNotSupported = 202,
  ParameterNotSupported = 203,
  DtvNotInUse = 300,
  NoDtvSignal = 302,
  InvalidHandle = 305,
}
