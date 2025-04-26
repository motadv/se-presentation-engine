import "dotenv/config";
import { startSocket } from "./infra/websocket/sepeClient";
import { DeviceRegistryImpl } from "./infra/effectRendererManager/deviceRegistryImpl";
import { DeviceControllerImpl } from "./infra/effectRendererManager/deviceControllerImpl";
import { debug } from "./utils/debugConsole";
import { RegisterSepeToGinga } from "./application/useCases/registerSepeToGinga.usecase";
import { GingaApiServiceImpl } from "./infra/api/gingaApiServiceImpl";
import { WebSocketServiceImpl } from "./infra/websocket/websocketServiceImpl";
import { DeregisterSepeFromGingaUsecase } from "./application/useCases/deregisterSepeFromGinga.usecase";
import {
  WsRequestMessage,
  WsResponseMessage,
} from "./domain/websocket/wsMessages.interface";

async function main() {
  const baseURL = process.env.HOST || "localhost";
  const port = process.env.PORT || "44642";

  // Initialize Controller and Registry
  const deviceRegistry = new DeviceRegistryImpl();
  const deviceController = new DeviceControllerImpl(deviceRegistry);

  const gingaApiService = new GingaApiServiceImpl(baseURL, port);

  // Register the SEPE with GINGA
  const { handle, url } = await new RegisterSepeToGinga(
    gingaApiService
  ).execute({
    deviceClass: "sensory-effect",
    supportedTypes: deviceController.getSupportedTypes(),
  });

  // Start the WebSocket server
  const gingaWS = new WebSocketServiceImpl();
  gingaWS.connect(url);

  // Define how to handle incoming messages from GINGA CCWS
  // Handle incoming messages from GINGA according to sepeccwsProtocol
  gingaWS.onMessage((message) => {
    const parsedMessage = JSON.parse(message) as WsRequestMessage;
    // Effect Renderer Control Message
    if ("action" in parsedMessage) {
      deviceController.handleData(parsedMessage);

      gingaWS.sendMessage({ ...parsedMessage, status: "success" });
    }
    // Request for capabilities Message
    else if ("capabilities" in parsedMessage) {
      // const { capabilities } = parsedMessage; // Ignored for now and send all capabilities
      deviceController.getCapabilities();

      gingaWS.sendMessage({ capabilities: deviceController.getCapabilities() });
    }
  });

  // Sets up SEPE for termination
  // Close the socket when the process is terminated
  process.on("SIGINT", async () => {
    debug("Shutting down Sensory Effect Presentation Engine.");
    if (gingaWS) {
      gingaWS.disconnect();
    }
    await new DeregisterSepeFromGingaUsecase(gingaApiService).execute(handle);
    debug("Unregistered device from GINGA.");
    debug("Disconnected from WebSocket server.");
    debug("Exiting process.");
    process.exit();
  });
}

main();
