import { IGingaApiService } from "../../domain/api/gingaApiService.interface";

export class DeregisterSepeFromGingaUsecase {
  constructor(private readonly gingaApiService: IGingaApiService) {}

  async execute(handle: string): Promise<void> {
    try {
      const response = await this.gingaApiService.deregisterDevice(handle);
    } catch (error) {
      console.error(`Failed to deregister device with GINGA: ${error}`);
    }
  }
}
