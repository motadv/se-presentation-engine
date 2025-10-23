import { PresentationData } from "../domain/types/rendererPresentationData.types";
import { MiioFanAdapter } from "../infra/effectRenderer/mi-fan.adapter";
import { DeviceControllerImpl } from "../infra/effectRendererManager/deviceControllerImpl";
import { DeviceRegistryImpl } from "../infra/effectRendererManager/deviceRegistryImpl";
import debug from "../utils/debugConsole";
import wait from "../utils/wait";

async function testMiioFanConnection() {
  debug("Iniciando o teste de conexão do Miio Fan...");

  // 1. Defina o IP e o TOKEN do seu ventilador aqui
  const FAN_IP = "192.168.1.23"; // <-- SUBSTITUA PELO IP DO SEU VENTILADOR
  const FAN_TOKEN = "6ac9ae4867729bd70b5832ff65a82fc6"; // <-- SUBSTITUA PELO TOKEN DO SEU VENTILADOR
  debug(`IP do ventilador: ${FAN_IP}`);

  // 2. Inicializar o Controller e o Registry
  const deviceRegistry = new DeviceRegistryImpl();
  const deviceController = new DeviceControllerImpl(deviceRegistry);

  // 3. Conectar-se diretamente ao ventilador usando o adaptador
  const fanDevice = new MiioFanAdapter({
    id: "miio-fan-1c-test",
    ip: FAN_IP,
    token: FAN_TOKEN,
  });
  deviceController.registerDevice(fanDevice);
  debug("Dispositivo ventilador registrado no controlador.");

  // Pausa para garantir que o handshake inicial tenha tempo de ser processado
  await wait(2000);

  // 4. Definir e enviar uma sequência de comandos de teste
  debug("Enviando sequência de comandos de teste para o ventilador...");

  // Comando 1: Ligar na velocidade 1 (intensidade de 1 a 25)
  const commandTurnOn: PresentationData = {
    effectType: "WindType",
    action: "start",
    properties: [
      { name: "intensityValue", value: 25 },
    ],
  };
  await deviceController.handleData(commandTurnOn);
  debug("Comando: LIGAR (Velocidade Nível 1) enviado.");
  await wait(5000); // Esperar 5 segundos

  // Comando 2: Mudar para velocidade 2 (intensidade 26 a 50)
  const commandSetLevel2: PresentationData = {
    effectType: "WindType",
    action: "set",
    properties: [
      { name: "intensityValue", value: 50 },
    ],
  };
  await deviceController.handleData(commandSetLevel2);
  debug("Comando: Mudar para Velocidade Nível 2 enviado.");
  await wait(5000); // Esperar 5 segundos

  // Comando 3: Mudar para velocidade 3 (intensidade 51 a 75)
  const commandSetLevel3: PresentationData = {
    effectType: "WindType",
    action: "set",
    properties: [
      { name: "intensityValue", value: 75 },
    ],
  };
  await deviceController.handleData(commandSetLevel3);
  debug("Comando: Mudar para Velocidade Nível 3 enviado.");
  await wait(5000); // Esperar 5 segundos

  // Comando Final: Desligar o ventilador
  const commandTurnOff: PresentationData = {
    effectType: "WindType",
    action: "stop",
  };
  await deviceController.handleData(commandTurnOff);
  debug("Comando: DESLIGAR enviado.");

  debug("Teste concluído! O processo será encerrado em 3 segundos.");
  await wait(3000);

  // Força o encerramento do processo, já que a conexão UDP pode mantê-lo ativo.
  process.exit(0);
}

// Executar a função de teste
testMiioFanConnection().catch(error => {
  console.error("ERRO FATAL NO TESTE:", error);
  process.exit(1);
});