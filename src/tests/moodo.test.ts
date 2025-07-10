import { DeviceControllerImpl } from "../infra/effectRendererManager/deviceControllerImpl";
import { DeviceRegistryImpl } from "../infra/effectRendererManager/deviceRegistryImpl";
import { MoodoAdapter } from "../infra/effectRenderer/moodo.adapter";
import { PresentationData } from "../domain/types/rendererPresentationData.types";
import debug from "../utils/debugConsole";
import wait from "../utils/wait";

/**
 * This is the main function for our test.
 * It connects to the Moodo API using your credentials and sends a sequence of commands.
 */
async function testMoodoConnection() {
  debug("Starting Moodo connection test...");

  // 1. Define your Moodo account credentials here
  const MOODO_EMAIL = "rmsodre@id.uff.br"; // <-- REPLACE WITH YOUR MOODO EMAIL
  const MOODO_PASSWORD = "moodormsodre"; // <-- REPLACE WITH YOUR MOODO PASSWORD
  debug(`Moodo Email: ${MOODO_EMAIL}`);

  // 2. Initialize the Controller and the Registry
  const deviceRegistry = new DeviceRegistryImpl();
  const deviceController = new DeviceControllerImpl(deviceRegistry);

  // 3. Connect to the device using your credentials
  debug(`Attempting to connect with account: ${MOODO_EMAIL}`);

  const moodoDevice = new MoodoAdapter(MOODO_EMAIL, MOODO_PASSWORD);
  deviceController.registerDevice(moodoDevice);

  debug("Device registered in the controller. Waiting for API connection...");

  // A longer pause to ensure the API authentication and device fetch is complete
  await wait(8000);

  // 4. Define and send a sequence of test commands
  debug("Sending test command sequence...");

  // Command 1: Start scent with 50% intensity
  const commandTurnOn: PresentationData = {
    effectType: "ScentType",
    action: "start",
    properties: [{ name: "intensityValue", value: 50 }],
  };
  await deviceController.handleData(commandTurnOn);
  debug("Command: START with 50% intensity sent.");
  await wait(5000); // Wait 5 seconds to observe the change

  // Command 2: Set intensity to 100%
  const commandSetFull: PresentationData = {
    effectType: "ScentType",
    action: "set",
    properties: [{ name: "intensityValue", value: 100 }],
  };
  await deviceController.handleData(commandSetFull);
  debug("Command: SET intensity to 100% sent.");
  await wait(5000); // Wait 5 seconds

  // Command 3: Set intensity to 20%
  const commandSetLow: PresentationData = {
    effectType: "ScentType",
    action: "set",
    properties: [{ name: "intensityValue", value: 20 }],
  };
  await deviceController.handleData(commandSetLow);
  debug("Command: SET intensity to 20% sent.");
  await wait(5000); // Wait 5 seconds

  // Final Command: Stop the scent
  const commandTurnOff: PresentationData = {
    effectType: "ScentType",
    action: "stop",
    properties: [],
  };
  await deviceController.handleData(commandTurnOff);
  debug("Command: STOP scent sent.");

  debug("Test finished! Closing in 5 seconds...");
  await wait(5000);

  // The process should end here.
  process.exit(0);
}

// Execute the test function
testMoodoConnection();