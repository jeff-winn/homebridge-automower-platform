import { Characteristic, Service } from 'homebridge';
import { AccessoryService } from '../../src/services/accessoryService';

export class AccessoryServiceSpy extends AccessoryService {
    public getCharacteristicType(): typeof Characteristic {
        return this.Characteristic;
    }

    public getServiceType(): typeof Service {
        return this.Service;
    }
}