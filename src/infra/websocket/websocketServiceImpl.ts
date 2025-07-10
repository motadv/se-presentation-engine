import { WebSocket } from "ws";
import { IWebSocketService } from "../../domain/websocket/websocketService.interface";
import { EffectType } from "../../domain/types/effectTypes.types";
import { Observer } from "../Pattern/ObserverController";
import { WsResponseMessage } from "../../domain/websocket/wsMessages.interface";

export class WebSocketServiceImpl
  implements IWebSocketService, Observer<EffectType[]>
{
  private socket: WebSocket | null = null;
  private messageCallback: ((message: object) => void) | null = null;

  connect(url: string): void {
    this.socket = new WebSocket(url);

    this.socket.on("open", () => {
      console.log("Connected to WebSocket");
    });

    this.socket.on("message", (data) => {
      if (this.messageCallback) {
        const message = JSON.parse(data.toString());
        this.messageCallback(message);
      }
    });

    this.socket.on("close", () => {
      console.log("Disconnected from WebSocket");
    });
  }

  disconnect(): void {
    if (this.socket) {
      this.socket.close();
    }
  }

  sendMessage(message: WsResponseMessage): void {
    if (this.socket) {
      this.socket.send(JSON.stringify(message));
    }
  }

  onMessage(callback: (message: object) => void): void {
    this.messageCallback = callback;
  }

  update(data: EffectType[]): void {
    throw new Error("Method not implemented.");
  }
}
