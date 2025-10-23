import { IEffectRenderer } from "../../domain/interfaces/EffectRenderer.interface";
import {
  DeviceCapabilities,
  DeviceState,
} from "../../domain/types/device.types";
import { EffectType, Location, Property } from "../../domain/types/effectTypes.types";
import * as dgram from "dgram";
import * as crypto from "crypto";
import { ActionType } from "../../domain/types/action.types";

const PORT = 54321;

interface MiioFanAdapterOptions {
  id: string;
  ip: string;
  token: string;
}

export class MiioFanAdapter implements IEffectRenderer {
  public readonly id: string;
  public readonly supportedTypes: EffectType[] = ["WindType"];
  public readonly capabilities: DeviceCapabilities[];

  private readonly address: string;
  private readonly token: Buffer;
  private readonly tokenKey: Buffer;
  private readonly tokenIv: Buffer;

  private deviceId: Buffer | null = null;
  private lastResponseTimestamp: number = 0;
  private socket: dgram.Socket;
  private messageCounter = 1;
  private currentState: DeviceState = "idle";

  constructor(options: MiioFanAdapterOptions, location: Location = "*:*:*" ) {
    this.id = options.id;
    this.address = options.ip;

    if (options.token.length !== 32) {
      throw new Error(
        "Token inválido. O token deve conter 32 caracteres hexadecimais"
      );
    }

    this.token = Buffer.from(options.token, "hex");

    // Deriva chaves de criptografia a partir do token
    this.tokenKey = crypto.createHash("md5").update(this.token).digest();
    this.tokenIv = crypto
      .createHash("md5")
      .update(this.tokenKey)
      .update(this.token)
      .digest();

    this.socket = dgram.createSocket("udp4");

    this.capabilities = [
      {
        effectType: "WindType",
        state: this.currentState,
        location: location
      },
    ];

    // Inicia a conexão (handshake) em segundo plano para agilizar o primeiro comando
    this.handshake().catch((err) => {
      console.error(`[${this.id}] Falha no handshake inicial:`, err.message);
    });
  }
  private encrypt(data: Buffer): Buffer {
    /* ... implementação ... */
    const cipher = crypto.createCipheriv(
      "aes-128-cbc",
      this.tokenKey,
      this.tokenIv
    );
    return Buffer.concat([cipher.update(data), cipher.final()]);
  }
  private decrypt(encryptedData: Buffer): Buffer {
    /* ... implementação ... */
    const decipher = crypto.createDecipheriv(
      "aes-128-cbc",
      this.tokenKey,
      this.tokenIv
    );
    return Buffer.concat([decipher.update(encryptedData), decipher.final()]);
  }

  private send(packet: Buffer): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      const onMessage = (msg: Buffer) => {
        this.socket.removeListener("message", onMessage);
        clearTimeout(timeout);
        const responseTimestamp = msg.readUInt32BE(12);
        if (responseTimestamp > 0)
          this.lastResponseTimestamp = responseTimestamp;
        resolve(msg);
      };
      const onError = (err: Error) => {
        this.socket.removeListener("message", onMessage);
        clearTimeout(timeout);
        reject(err);
      };
      const timeout = setTimeout(
        () => onError(new Error(`Timeout de comunicação com ${this.address}`)),
        5000
      );
      this.socket.once("message", onMessage);
      this.socket.once("error", onError);
      this.socket.send(packet, PORT, this.address, (err) => {
        if (err) onError(err);
      });
    });
  }

  private async handshake(): Promise<void> {
    const handshakePacket = Buffer.from(
      "21310020ffffffffffffffffffffffffffffffffffffffffffffffffffffffff",
      "hex"
    );
    try {
      const response = await this.send(handshakePacket);
      this.deviceId = response.slice(8, 12);
    } catch (e) {
      this.deviceId = null;
      throw e;
    }
  }

  private async call(method: string, params: any): Promise<any> {
    if (!this.deviceId) await this.handshake();
    if (!this.deviceId)
      throw new Error(
        "Não foi possível conectar ao dispositivo (handshake falhou)."
      );

    const jsonPayload = JSON.stringify({
      id: this.messageCounter++,
      method,
      params,
    });
    const encryptedPayload = this.encrypt(Buffer.from(jsonPayload, "utf8"));
    const header = Buffer.alloc(32);
    header.writeUInt16BE(0x2131, 0);
    header.writeUInt16BE(32 + encryptedPayload.length, 2);
    header.writeUInt32BE(0x00000000, 4);
    this.deviceId.copy(header, 8);
    header.writeUInt32BE(
      this.lastResponseTimestamp > 0 ? this.lastResponseTimestamp + 1 : 0,
      12
    );

    const checksum = crypto
      .createHash("md5")
      .update(header.slice(0, 16))
      .update(this.token)
      .update(encryptedPayload)
      .digest();
    checksum.copy(header, 16);

    const finalPacket = Buffer.concat([header, encryptedPayload]);
    const responsePacket = await this.send(finalPacket);
    const encryptedResponse = responsePacket.slice(32);
    if (encryptedResponse.length === 0)
      return { id: this.messageCounter - 1, result: ["ok"] };

    const decryptedResponse = this.decrypt(encryptedResponse);
    const responseString = decryptedResponse
      .toString("utf8")
      .replace(/\0/g, "");
    const response = JSON.parse(responseString);

    if (response.error) {
      throw new Error(
        `Erro do dispositivo: ${response.error.message} (código: ${response.error.code})`
      );
    }
    return response;
  }

  private async setProperty(
    siid: number,
    piid: number,
    value: any
  ): Promise<any> {
    const params = [{ did: "prop", siid, piid, value }];
    return this.call("set_properties", params);
  }

  private mapIntensityToFanLevel(intensity: number): 1 | 2 | 3 | 4 {
    if (intensity <= 0) return 1;
    if (intensity <= 25) return 1;
    if (intensity <= 50) return 2;
    if (intensity <= 75) return 3;
    return 4;
  }

  private updateState(newState: DeviceState): void {
    this.currentState = newState;
    const windCapability = this.capabilities.find(
      (c) => c.effectType === "WindType"
    );
    if (windCapability) {
      windCapability.state = this.currentState;
    }
  }

  // --- IMPLEMENTAÇÃO DA INTERFACE IEffectRenderer ---

  public async handleCommand(
    action: ActionType,
    properties: Property[] = []
  ): Promise<void> {
    console.log(`[${this.id}] Recebido comando: ${action}`, properties);

    switch (action) {
      case "start": {
        await this.setProperty(2, 1, true); // Ligar
        this.updateState("playing");

        const intensityProp = properties.find(
          (p) => p.name === "intensityValue"
        );
        if (intensityProp) {
          const level = this.mapIntensityToFanLevel(
            intensityProp.value as number
          );
          await this.setProperty(2, 2, level); // Ajustar nível
        }
        break;
      }

      case "stop": {
        await this.setProperty(2, 1, false); // Desligar
        this.updateState("stopped");
        break;
      }

      case "set": {
        for (const prop of properties) {
          if (prop.name === "intensityValue") {
            const level = this.mapIntensityToFanLevel(prop.value as number);
            await this.setProperty(2, 2, level); // Ajustar nível

            // Garante que o ventilador esteja ligado ao mudar a intensidade
            await this.setProperty(2, 1, true);
            this.updateState("playing");
          }
        }
        break;
      }

      case "prepare": {
        this.updateState("preparing");
        await this.handshake();
        this.updateState("prepared");
        break;
      }

      default:
        console.warn(`[${this.id}] Comando não suportado: ${action}`);
        // Não lançamos erro para comandos desconhecidos
        return Promise.resolve();
    }
  }
}
