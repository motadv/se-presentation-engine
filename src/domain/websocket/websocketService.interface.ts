import { WsRequestMessage, WsResponseMessage } from "./wsMessages.interface";

export interface IWebSocketService {
  connect(url: string): void;
  disconnect(): void;
  sendMessage(message: WsResponseMessage): void;
  onMessage(callback: (message: object) => void): void;
}
