import { CloseEvent, Event, MessageEvent } from "ws";
import { DeviceControllerImpl } from "../effectRendererManager/deviceControllerImpl";

const handleOnClose = (
  event: CloseEvent,
  deviceController: DeviceControllerImpl
) => {
  console.log(`Disconnected from WebSocket server with code ${event.code}`);
  deviceController.clearRegistry();
};

const handleOnOpen = (event: Event, deviceController: DeviceControllerImpl) => {
  console.log("Connected to WebSocket server");
};

const handleOnMessage = (
  messageEvent: MessageEvent,
  deviceController: DeviceControllerImpl
) => {
  if (typeof messageEvent.data !== "string") {
    console.error("Received message is not a string");
    return;
  }

  const data = JSON.parse(messageEvent.data);
  console.log(`Received message: ${data}`);
};

const handleOnError = (
  error: Event,
  deviceController: DeviceControllerImpl
) => {
  console.error("WebSocket error:", error);
  deviceController.clearRegistry();
};

export { handleOnClose, handleOnError, handleOnMessage, handleOnOpen };
