import { DeviceControllerImpl } from "../infra/effectRendererManager/deviceControllerImpl";
import { DeviceRegistryImpl } from "../infra/effectRendererManager/deviceRegistryImpl";
import { YeelightAdapter } from "../infra/effectRenderer/yeelight.adapter";
// A função de descoberta já não é necessária, mas pode ser mantida para referência futura
// import { discoverYeelights } from "./infra/effectRenderer/yeelight.discover";
import { PresentationData } from "../domain/types/rendererPresentationData.types";
import debug from "../utils/debugConsole";
import wait from "../utils/wait";

/**
 * Esta é a função principal para o nosso teste.
 * Ela conecta-se a uma lâmpada com IP conhecido e envia uma sequência de comandos.
 */
async function testYeelightConnection() {
  debug("Iniciando o teste de conexão da Yeelight com IP conhecido...");

  // 1. Defina o endereço IP da sua lâmpada aqui
  const KNOWN_LIGHT_IP = "192.168.1.10"; // <-- SUBSTITUA PELO IP DA SUA LÂMPADA
  const KNOWN_LIGHT_PORT = 55443; // Porta padrão da Yeelight
  debug(`IP da lâmpada: ${KNOWN_LIGHT_IP}, Porta: ${KNOWN_LIGHT_PORT}`);

  // 2. Inicializar o Controller e o Registry
  const deviceRegistry = new DeviceRegistryImpl();
  const deviceController = new DeviceControllerImpl(deviceRegistry);

  // 3. Conectar-se diretamente à lâmpada usando o IP conhecido
  debug(`A tentar conectar-se a: ${KNOWN_LIGHT_IP}`);

  const yeelightLamp = new YeelightAdapter(KNOWN_LIGHT_IP, KNOWN_LIGHT_PORT);
  deviceController.registerDevice(yeelightLamp);

  debug("Dispositivo registado no controlador. A aguardar pela ligação...");

  // Pequena pausa para garantir que a ligação TCP é estabelecida
  await wait(2000);

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
  await deviceController.handleData(commandTurnOnBlue);
  debug("Comando: LIGAR e cor AZUL enviado.");
  await wait(3000); // Esperar 3 segundos

  // Comando 2: Mudar a cor para vermelho
  const commandSetRed: PresentationData = {
    effectType: "LightType",
    action: "set",
    properties: [
      { name: "color", value: [255, 0, 0] }, // Vermelho (usando o formato de array)
    ],
  };
  await deviceController.handleData(commandSetRed);
  debug("Comando: Mudar para VERMELHO enviado.");
  await wait(3000); // Esperar 3 segundos

  // Comando 3: Mudar a cor para verde com 10% de brilho
  const commandSetGreen: PresentationData = {
    effectType: "LightType",
    action: "set",
    properties: [
      { name: "color", value: "#00FF00" }, // Verde
      { name: "intensityValue", value: 10 },
    ],
  };
  await deviceController.handleData(commandSetGreen);
  debug("Comando: Mudar para VERDE enviado.");
  await wait(3000); // Esperar 3 segundos

  // Comando 4: Mudar a cor para verde com 100% de brilho
  const commandSetGreenFull: PresentationData = {
    effectType: "LightType",
    action: "set",
    properties: [
      { name: "color", value: "#00FF00" }, // Verde
      { name: "intensityValue", value: 100 },
    ],
  };
  await deviceController.handleData(commandSetGreenFull);
  debug("Comando: Mudar para VERDE com 100% de brilho enviado.");
  await wait(3000); // Esperar 3 segundos

  // Comando Final: Desligar a lâmpada
  const commandTurnOff: PresentationData = {
    effectType: "LightType",
    action: "stop",
    properties: [],
  };
  await deviceController.handleData(commandTurnOff);
  debug("Comando: DESLIGAR enviado.");

  debug("Teste concluído! A fechar em 5 segundos...");
  await wait(5000);

  // O processo deve terminar aqui. Em aplicações reais, você precisaria de uma forma de fechar as conexões.
  process.exit(0);
}

// Executar a função de teste
testYeelightConnection();
