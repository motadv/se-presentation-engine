import "dotenv/config";
import { startSocket } from "./infra/websocket/sepeClient";
import { DeviceRegistryImpl } from "./infra/effectRendererManager/deviceRegistryImpl";
import { DeviceControllerImpl } from "./infra/effectRendererManager/deviceControllerImpl";
import { debug } from "./utils/debugConsole";
import { RegisterSepeToGinga } from "./application/useCases/registerSepeToGinga.usecase";
import { GingaApiServiceImpl } from "./infra/api/gingaApiServiceImpl";
import { WebSocketServiceImpl } from "./infra/websocket/websocketServiceImpl";

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

  // Close the socket when the process is terminated
  process.on("SIGINT", () => {
    debug("Shutting down Sensory Effect Presentation Engine.");
    if (gingaSocket) {
      gingaSocket.close();
    }
    process.exit();
  });
}

main();
