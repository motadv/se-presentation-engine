import "dotenv/config";
import { startSocket } from "./infra/websocket/sepeClient";
import { DeviceRegistryImpl } from "./infra/effectRendererManager/deviceRegistryImpl";
import { DeviceControllerImpl } from "./infra/effectRendererManager/deviceControllerImpl";
import debug from "./utils/debugConsole";
import { RegisterSepeToGinga } from "./application/useCases/registerSepeToGinga.usecase";
import { GingaApiServiceImpl } from "./infra/api/gingaApiServiceImpl";
import { WebSocketServiceImpl } from "./infra/websocket/websocketServiceImpl";
import { DeregisterSepeFromGingaUsecase } from "./application/useCases/deregisterSepeFromGinga.usecase";
import {
  WsRequestMessage,
  WsResponseMessage,
} from "./domain/websocket/wsMessages.interface";
import { YeelightAdapter } from "./infra/effectRenderer/yeelight.adapter";
import { MoodoAdapter } from "./infra/effectRenderer/moodo.adapter";

async function main() {
  const baseURL = process.env.HOST || "localhost";
  const port = process.env.PORT || "44642";

  // Initialize Controller and Registry
  const deviceRegistry = new DeviceRegistryImpl();
  const deviceController = new DeviceControllerImpl(deviceRegistry);

  // Start the SEPE Client and connect Renderers

  // const mockHttpLight = new HttpLightAdapter("http://localhost:3000");
  // deviceController.registerDevice(mockHttpLight);

  const yeelightAdapter = new YeelightAdapter("192.168.1.10");
  deviceController.registerDevice(yeelightAdapter);
  
  const moodoAdapter = new MoodoAdapter(
    "rmsodre@id.uff.br",
    "moodormsodre"
  );
  deviceController.registerDevice(moodoAdapter);

  debug("Registered devices to SEPE.");

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
  gingaWS.onMessage((rawMessage) => {
    // Effect Renderer Control Message
    const message: WsRequestMessage = rawMessage as WsRequestMessage;
    console.log("Received message:", message);

    if ("action" in message) {
      console.log("Action received at ", Date.now())
      deviceController.handleData(message);

      gingaWS.sendMessage({ ...message, status: "success" });
    }
    // Request for capabilities Message
    else if ("capabilities" in message) {
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
