import { IGingaApiService } from "../../domain/api/gingaApiService.interface";
import { RegisterDeviceRequest } from "../../domain/api/httpMessages.interface";
import debug from "../../utils/debugConsole";

export class RegisterSepeToGinga {
  constructor(private gingaApiService: IGingaApiService) {}

  async execute(
    request: RegisterDeviceRequest
  ): Promise<{ handle: string; url: string }> {
    const MAX_REGISTRATION_ATTEMPTS = 5;

    // Register the SEPE with GINGA
    let registrationAttempts = MAX_REGISTRATION_ATTEMPTS;
    let registration = await this.gingaApiService.registerDevice(request);
    while (!registration) {
      debug("Failed to register with GINGA, retrying in 5 seconds");
      var nextRetry = Date.now() + 5000;
      while (Date.now() < nextRetry);

      registration = await this.gingaApiService.registerDevice(request);
      registrationAttempts--;
      if (registrationAttempts === 0) {
        debug("Failed to register with GINGA after 5 attempts, shutting down.");
        process.exit(1);
      }
    }

    const { handle, url } = registration;
    debug(`Registered device with GINGA at ${url}.\nHandle: ${handle}\n`);

    return { handle, url };
  }
}
