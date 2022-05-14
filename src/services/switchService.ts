import { API, Characteristic, CharacteristicEventTypes, 
    CharacteristicSetCallback, CharacteristicValue, PlatformAccessory, Service 
} from 'homebridge';

import { AutomowerContext } from '../automowerAccessory';
import { AccessoryService } from './accessoryService';

/**
 * An abstract class which supports an accessory switch.
 */
export abstract class SwitchService extends AccessoryService {
    private switchService?: Service;
    private on?: Characteristic;

    public constructor(protected name: string, accessory: PlatformAccessory<AutomowerContext>, api: API) {
        super(accessory, api);
    }
    
    public getUnderlyingService(): Service | undefined {
        return this.switchService;
    }

    public init(): void {
        this.switchService = this.accessory.getServiceById(this.Service.Switch, this.name);
        if (this.switchService === undefined) {
            this.switchService = new this.Service.Switch(`${this.accessory.displayName} ${this.name}`, this.name);
            this.accessory.addService(this.switchService);
        }

        this.on = this.switchService.getCharacteristic(this.Characteristic.On)
            .on(CharacteristicEventTypes.SET, this.onSetCallback.bind(this));
    }

    private onSetCallback(value: CharacteristicValue, callback: CharacteristicSetCallback): Promise<void> {
        const actualValue = value as boolean;
        return this.onSet(actualValue, callback);
    }

    protected abstract onSet(on: boolean, callback: CharacteristicSetCallback): Promise<void>;
}