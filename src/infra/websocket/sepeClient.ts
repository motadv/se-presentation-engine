import WebSocket, { CloseEvent, Event, MessageEvent } from "ws";
import {
  handleOnClose,
  handleOnError,
  handleOnMessage,
  handleOnOpen,
} from "./handlers";
import { DeviceControllerImpl } from "../effectRendererManager/deviceControllerImpl";

function startSocket(
  wsUrl: string,
  deviceController: DeviceControllerImpl
): WebSocket {
  const socket = new WebSocket(wsUrl);

  socket.on("open", (event: Event) => handleOnOpen(event, deviceController));

  socket.on("close", (event: CloseEvent) =>
    handleOnClose(event, deviceController)
  );

  socket.on("message", (messageEvent: MessageEvent) =>
    handleOnMessage(messageEvent, deviceController)
  );

  socket.on("error", (error: Event) => handleOnError(error, deviceController));

  return socket;
}

export { startSocket };
