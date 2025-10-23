import { DeviceControllerImpl } from "../infra/effectRendererManager/deviceControllerImpl";
import { DeviceRegistryImpl } from "../infra/effectRendererManager/deviceRegistryImpl";
// A função de descoberta já não é necessária, mas pode ser mantida para referência futura
// import { discoverYeelights } from "./infra/effectRenderer/yeelight.discover";
import { PresentationData } from "../domain/types/rendererPresentationData.types";
import debug from "../utils/debugConsole";
import wait from "../utils/wait";
import { HttpLightAdapter } from "../infra/effectRenderer/mock-httplight.adapter";

/**
 * Esta é a função principal para o nosso teste.
 * Ela conecta-se a uma lâmpada com IP conhecido e envia uma sequência de comandos.
 */
async function testLocationRenderers() {
  debug("Iniciando o teste de conexão da Yeelight com IP conhecido...");

  // 2. Inicializar o Controller e o Registry
  const deviceRegistry = new DeviceRegistryImpl();
  const deviceController = new DeviceControllerImpl(deviceRegistry);

  // 3. Conectar-se diretamente à lâmpada usando o IP conhecido
  const mockRightLamp = new HttpLightAdapter(
    "www.right.lamp",
    "right:top:*",
    "right"
  );
  const mockLeftLamp = new HttpLightAdapter(
    "www.left.lamp",
    "left:bottom:*",
    "left"
  );
  deviceController.registerDevice(mockRightLamp);
  deviceController.registerDevice(mockLeftLamp);

  debug("Dispositivos registados no controlador. A aguardar requests...");

  // Pequena pausa para garantir que a ligação TCP é estabelecida

  // 4. Definir e enviar uma sequência de comandos de teste
  debug("A enviar sequência de comandos de teste...");

  // Comando 1: Ligar e definir a cor para azul com 75% de brilho
  const commandTurnOnBlue: PresentationData = {
    effectType: "LightType",
    action: "start",
    properties: [
      { name: "color", value: "#0000FF" }, // Azul
      { name: "intensityValue", value: 75 },
    ],
  };
  debug("\nComando: LIGAR e cor AZUL enviado para todas as luzes.");
  await deviceController.handleData(commandTurnOnBlue);

  // Comando 2: Mudar a cor para vermelho
  const commandSetRed: PresentationData = {
    effectType: "LightType",
    action: "set",
    properties: [
      { name: "color", value: [255, 0, 0] }, // Vermelho (usando o formato de array)
      { name: "location", value: "right:*:*" }, // Apenas para a lâmpada da direita
    ],
  };
  debug("\nComando: Mudar para VERMELHO enviado para as lampadas da direita.");
  await deviceController.handleData(commandSetRed);

  // Comando 3: Mudar a cor para verde com 10% de brilho
  const commandSetGreen: PresentationData = {
    effectType: "LightType",
    action: "set",
    properties: [
      { name: "color", value: "#00FF00" }, // Verde
      { name: "location", value: "left:*:*" }, // Apenas para a lampada da esquerda
    ],
  };
  debug("\nComando: Mudar para VERDE enviado para as lampadas da esquerda.");
  await deviceController.handleData(commandSetGreen);

  // Comando 4: Mudar a cor para verde com 100% de brilho
  const commandSetGreenFull: PresentationData = {
    effectType: "LightType",
    action: "set",
    properties: [
      { name: "color", value: "#00FF00" }, // Verde
      { name: "location", value: "*:top:*" }, // Apenas para as lâmpadas em cima
    ],
  };
  debug("\nComando: Mudar para VERDE enviado para as lâmpadas de cima.");
  await deviceController.handleData(commandSetGreenFull);

  // Comando Final: Desligar todas as lâmpadas
  const commandTurnOff: PresentationData = {
    effectType: "LightType",
    action: "stop",
    properties: [],
  };
  debug("\nComando: DESLIGAR enviado para todas as lâmpadas.");
  await deviceController.handleData(commandTurnOff);

  // O processo deve terminar aqui. Em aplicações reais, você precisaria de uma forma de fechar as conexões.
  process.exit(0);
}

// Executar a função de teste
testLocationRenderers();
