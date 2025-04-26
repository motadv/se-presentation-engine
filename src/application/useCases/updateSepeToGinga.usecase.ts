import { IGingaApiService } from "../../domain/api/gingaApiService.interface";
import {
  RegisterDeviceRequest,
  RegisterDeviceResponse,
} from "../../domain/api/httpMessages.interface";

export class UpdateSepeToGingaUseCase {
  constructor(private readonly gingaApiService: IGingaApiService) {}

  async execute(
    handle: string,
    request: RegisterDeviceRequest
  ): Promise<Omit<RegisterDeviceResponse, "url">> {
    const registration = await this.gingaApiService.updateDevice(
      handle,
      request
    );

    return registration;
  }
}
