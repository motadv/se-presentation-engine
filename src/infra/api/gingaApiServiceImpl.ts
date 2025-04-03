import { IGingaApiService } from "../../domain/api/gingaApiService.interface";

export class GingaApiServiceImpl implements IGingaApiService {
  constructor(
    private readonly host: string,
    private readonly port: string
  ) {}

  async registerDevice(
    ...[registerRequest]: Parameters<IGingaApiService["registerDevice"]>
  ): ReturnType<IGingaApiService["registerDevice"]> {
    const response = await fetch(
      `http://${this.host}:${this.port}/dtv/remote-device`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(registerRequest),
      }
    );

    if (!response.ok) {
      throw new Error(
        `Failed to register device with GINGA: ${response.status}`
      );
    }

    const { handle, url } = await response.json();

    return { handle, url };
  }

  async deregisterDevice(
    ...[handle]: Parameters<IGingaApiService["deregisterDevice"]>
  ): ReturnType<IGingaApiService["deregisterDevice"]> {
    const response = await fetch(
      `http://${this.host}:${this.port}/dtv/remote-device/${handle}`,
      {
        method: "DELETE",
      }
    );

    if (!response.ok) {
      console.error(
        `Failed to unregister device with GINGA: ${response.status}`
      );
    }

    return {};
  }

  async updateDevice(
    ...[handle, request]: Parameters<IGingaApiService["updateDevice"]>
  ): ReturnType<IGingaApiService["updateDevice"]> {
    const response = await fetch(
      `http://${this.host}:${this.port}/dtv/remote-device/${handle}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(request),
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to update device with GINGA: ${response.status}`);
    }

    const { newHandle } = await response.json();

    return { handle: newHandle };
  }
}
