import { IDeviceRegistry } from "../../domain/interfaces/DeviceRegistry.interface";
import { IEffectRenderer } from "../../domain/interfaces/EffectRenderer.interface";
import { EffectType, MPEGV } from "../../domain/types/effectTypes.types";
import debug from "../../utils/debugConsole";

export class DeviceRegistryImpl implements IDeviceRegistry {
  private devices: IEffectRenderer[] = [];

  register(device: IEffectRenderer): void {
    this.devices.push(device);
  }

  remove(deviceId: IEffectRenderer["id"]): void {
    this.devices.filter((device) => device.id !== deviceId);
  }

  clearRegistry(): void {
    this.devices = [];
  }

  getDevicesByType(type: EffectType): IEffectRenderer[] {
    return this.devices.filter((device) =>
      device.supportedTypes.includes(type)
    );
  }

  getAllDevices(): IEffectRenderer[] {
    return this.devices;
  }

  getDeviceByTypeAndLocation(targetType: EffectType, targetLocation: MPEGV): IEffectRenderer[] {
    return this.devices.filter(device => {
      return device.capabilities.some(capability => {
        const typeMatches = capability.effectType === targetType;
        
        // TODO: Considerar de alguma forma as coordenadas polares. Por enquanto só checamos para coordenadas ICC
        const isLocationICC = typeof capability.location === 'string'

        if(typeMatches && isLocationICC) {
          return this.isIccMatch(capability.location as MPEGV, targetLocation)
        }

        // Se não for do tipo correto nem for a location desejada
        return false;
      })
    })
  }

  isIccMatch(location: MPEGV, filter: MPEGV): boolean {
    if (filter === "*:*:*" || location === "*:*:*") {
      debug(`Match automático de sucesso porque filter = [${filter}] e location = [${location}]`)
    };

    const [locationX, locationY, locationZ] = location.split(":");
    const [filterX, filterY, filterZ] = filter.split(":");

    const matchX = (filterX === "*") || (locationX === "*") || (filterX === locationX);
    const matchY = (filterY === "*") || (locationY === "*") || (filterY === locationY);
    const matchZ = (filterZ === "*") || (locationZ === "*") || (filterZ === locationZ);
    
    return matchX && matchY && matchZ
  }

}
