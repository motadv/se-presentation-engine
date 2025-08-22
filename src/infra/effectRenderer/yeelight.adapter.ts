import { IEffectRenderer } from "../../domain/interfaces/EffectRenderer.interface";
import {
  DeviceCapabilities,
  DeviceState,
} from "../../domain/types/device.types";
import {
  EffectType,
  Property,
  ColorValue,
} from "../../domain/types/effectTypes.types";
import { v4 as uuidv4 } from "uuid";
import * as net from "net";
import { ActionType } from "../../domain/types/action.types";

// Tipos específicos para os comandos da Yeelight
type YeelightCommand = {
  id: number;
  method: string;
  params: (string | number)[];
};

type YeelightResponse = {
  id: number;
  result?: string[];
  error?: { code: number; message: string };
};

type YeelightNotification = {
  method: "props";
  params: { [key: string]: string | number };
};

export class YeelightAdapter implements IEffectRenderer {
  id: string;
  supportedTypes: EffectType[] = ["LightType"];
  capabilities: DeviceCapabilities[];

  private client: net.Socket;
  private commandId: number = 1;
  private deviceState: DeviceState = "idle";
  private deviceIp: string;
  private devicePort: number;

  constructor(ip: string, port: number = 55443) {
    this.id = uuidv4();
    this.deviceIp = ip;
    this.devicePort = port;
    this.client = new net.Socket();
    this.capabilities = [
      {
        effectType: "LightType",
        state: this.deviceState,
        locator: `yeelight://${this.deviceIp}:${this.devicePort}`,
      },
    ];

    this.connect();
    this.setupListeners();
  }

  /**
   * Conecta ao socket TCP da lâmpada Yeelight.
   */
  private connect() {
    this.client.connect(this.devicePort, this.deviceIp, () => {
      console.log(`[Yeelight] Conectado a ${this.deviceIp}:${this.devicePort}`);
      this.deviceState = "prepared";
      this.updateCapabilitiesState();
    });
  }

  /**
   * Configura os listeners para os eventos do socket.
   */
  private setupListeners() {
    this.client.on("data", (data) => {
      const messages = data.toString().split("\r\n").filter(Boolean);
      messages.forEach((message) => {
        try {
          const parsedMessage = JSON.parse(message);
          if ("method" in parsedMessage && parsedMessage.method === "props") {
            this.handleNotification(parsedMessage as YeelightNotification);
          } else {
            this.handleResponse(parsedMessage as YeelightResponse);
          }
        } catch (error) {
          console.error("[Yeelight] Erro ao processar mensagem:", error);
        }
      });
    });

    this.client.on("close", () => {
      console.log("[Yeelight] Conexão fechada.");
      this.deviceState = "idle";
      this.updateCapabilitiesState();
      // Tenta reconectar após um tempo
      setTimeout(() => this.connect(), 5000);
    });

    this.client.on("error", (err) => {
      console.error("[Yeelight] Erro de conexão:", err.message);
      this.deviceState = "idle";
      this.updateCapabilitiesState();
    });
  }

  /**
   * Lida com as respostas aos comandos enviados.
   * @param response A resposta da lâmpada.
   */
  private handleResponse(response: YeelightResponse) {
    // console.log("[Yeelight] Resposta recebida:", response);
    if (response.error) {
      console.error(
        `[Yeelight] Erro no comando ${response.id}: ${response.error.message}`
      );
    }
  }

  /**
   * Lida com as notificações de mudança de estado da lâmpada.
   * @param notification A notificação da lâmpada.
   */
  private handleNotification(notification: YeelightNotification) {
    // console.log("[Yeelight] Notificação recebida:", notification.params);
    // Aqui você pode implementar a lógica para atualizar o estado interno
    // com base nas propriedades recebidas (power, bright, etc.)
    if (notification.params.power) {
      this.deviceState =
        notification.params.power === "on" ? "playing" : "stopped";
      this.updateCapabilitiesState();
    }
  }

  /**
   * Envia um comando para a lâmpada.
   * @param method O método a ser chamado.
   * @param params Os parâmetros do método.
   * @returns Uma promessa que resolve quando o comando é enviado.
   */
  private sendCommand(
    method: string,
    params: (string | number)[]
  ): Promise<void> {
    return new Promise((resolve, reject) => {
      if (this.client.destroyed || !this.client.writable) {
        console.error("[Yeelight] Socket não está pronto para escrita.");
        return reject(new Error("Socket not connected"));
      }
      const command: YeelightCommand = {
        id: this.commandId++,
        method,
        params,
      };
      const message = JSON.stringify(command) + "\r\n";
      // console.log("[Yeelight] Enviando comando:", message.trim());
      this.client.write(message, "utf-8", (err) => {
        if (err) {
          return reject(err);
        }
        resolve();
      });
    });
  }

  private updateCapabilitiesState() {
    this.capabilities[0].state = this.deviceState;
  }

  async handleCommand(
    action: ActionType,
    properties: Property[]
  ): Promise<void> {
    this.deviceState = "playing";
    this.updateCapabilitiesState();

    console.log("[Yeelight] Received command at ", Date.now());

    switch (action) {
      case "start":
        await this.sendCommand("set_power", ["on", "smooth", 500]);
        await this.setProperties(properties);
        break;
      case "stop":
        this.deviceState = "stopped";
        this.updateCapabilitiesState();
        await this.sendCommand("set_power", ["off", "smooth", 500]);
        break;
      case "set":
        await this.setProperties(properties);
        break;
      default:
        console.warn(`[Yeelight] Ação '${action}' não suportada.`);
    }

    console.log("[Yeelight] Command processed at ", Date.now());
  }

  private async setProperties(properties: Property[]) {
    for (const prop of properties) {
      switch (prop.name) {
        case "intensity": // Mapeado para 'brightness'
          await this.setBrightness(prop.value as number);
          break;
        case "color":
          await this.setColor(prop.value as ColorValue);
          break;
        // Outras propriedades como 'frequency' não são diretamente suportadas pela Yeelight
        // mas podem ser simuladas com 'start_cf' (color flow).
      }
    }
  }

  private async setBrightness(value: number) {
    // Yeelight espera um valor entre 1 e 100.
    const brightness = Math.max(1, Math.min(100, value));
    await this.sendCommand("set_bright", [brightness, "smooth", 500]);
  }

  private async setColor(value: ColorValue) {
    let r: number, g: number, b: number;

    if (typeof value === "string" && value.startsWith("#")) {
      // Lida com string hexadecimal, ex: "#RRGGBB"
      r = parseInt(value.slice(1, 3), 16);
      g = parseInt(value.slice(3, 5), 16);
      b = parseInt(value.slice(5, 7), 16);
    } else if (Array.isArray(value) && value.length === 3) {
      // Lida com array de números, ex: [r, g, b]
      [r, g, b] = value;
    } else {
      console.error("[Yeelight] Formato de cor inválido:", value);
      return; // Retorna se o formato for inválido
    }

    // O protocolo Yeelight usa um inteiro para representar a cor RGB
    const rgbInt = r * 65536 + g * 256 + b;
    await this.sendCommand("set_rgb", [rgbInt, "smooth", 500]);
  }
}
