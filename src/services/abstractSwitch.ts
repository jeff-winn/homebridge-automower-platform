import {
    API, Characteristic, CharacteristicEventTypes,
    CharacteristicSetCallback, CharacteristicValue, PlatformAccessory, Service
} from 'homebridge';

import { AutomowerContext } from '../automowerAccessory';
import { PlatformLogger } from '../diagnostics/platformLogger';
import { AbstractAccessoryService } from './abstractAccessoryService';

/**
 * An abstract class which encapsulates an accessory switch.
 */
export abstract class AbstractSwitch extends AbstractAccessoryService {
    private switchService?: Service;
    private on?: Characteristic;
    
    private lastValue = false;

    public constructor(protected name: string, accessory: PlatformAccessory<AutomowerContext>, api: API, protected log: PlatformLogger) {
        super(accessory, api);
    }
    
    public getUnderlyingService(): Service | undefined {
        return this.switchService;
    }    

    public init(prepend: boolean): void {
        this.switchService = this.accessory.getServiceById(this.Service.Switch, this.name);
        if (this.switchService === undefined) {
            let displayName = this.name;
            if (prepend) {
                displayName = `${this.accessory.displayName} ${this.name}`;
            }

            this.switchService = this.createService(displayName);
            this.accessory.addService(this.switchService);
        }

        this.on = this.switchService.getCharacteristic(this.Characteristic.On)
            .on(CharacteristicEventTypes.SET, this.onSetCallback.bind(this));
    }

    protected onSetCallback(value: CharacteristicValue, callback: CharacteristicSetCallback): Promise<void> {
        const actualValue = value as boolean;
        return this.onSet(actualValue, callback);
    }

    protected abstract onSet(on: boolean, callback: CharacteristicSetCallback): Promise<void>;

    protected createService(displayName: string): Service {
        return new this.Service.Switch(displayName, this.name);
    }

    protected updateValue(on: boolean): void {
        if (this.on === undefined) {
            throw new Error('The service has not been initialized.');
        }

        if (this.lastValue === on) {
            // The value is already set to what is requested, don't change anything.
            return;
        }

        this.on.updateValue(on);

        this.log.info(`Changed '%s' for '%s': ${on ? 'ON' : 'OFF'}`, this.name, this.accessory.displayName);
        this.setLastValue(on);
    }

    protected setLastValue(value: boolean): void {
        this.lastValue = value;
    }
}