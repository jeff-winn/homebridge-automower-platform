import { Characteristic, Service } from 'homebridge';
import { AbstractAccessoryService } from '../../../src/services/homebridge/abstractAccessoryService';

export class AccessoryServiceSpy extends AbstractAccessoryService {
    public getCharacteristicType(): typeof Characteristic {
        return this.Characteristic;
    }

    public getServiceType(): typeof Service {
        return this.Service;
    }
}