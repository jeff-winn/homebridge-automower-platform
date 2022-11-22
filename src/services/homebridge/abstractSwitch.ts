import {
    API, Characteristic, CharacteristicEventTypes,
    CharacteristicSetCallback, CharacteristicValue, PlatformAccessory, Service
} from 'homebridge';

import { AutomowerContext } from '../../automowerAccessory';
import { PlatformLogger } from '../../diagnostics/platformLogger';
import { MowerMetadata } from '../../model';
import { AbstractAccessoryService } from './abstractAccessoryService';

/**
 * Defines the modes for the name of the switch.
 */
export enum NameMode {
    /**
     * The default mode, just use the name.
     */
    DEFAULT = 'DEFAULT',

    /**
     * Use the display name of the accessory.
     */
    DISPLAY_NAME = 'DISPLAY_NAME'
}

/**
 * Identifies a switch.
 */
export interface Switch {
    /**
     * Initializes the switch.
     * @param mode The mode for the switch name.
     */
    init(mode: NameMode): void;

    /**
     * Sets the mower metadata.
     * @param metadata The metadata.
     */
     setMowerMetadata(metadata: MowerMetadata): void;
}

/**
 * An abstract class which encapsulates an accessory switch.
 */
export abstract class AbstractSwitch extends AbstractAccessoryService implements Switch {
    private switchService?: Service;
    private on?: Characteristic;
    private statusActive?: Characteristic;    
    
    private lastValue?: boolean;

    public constructor(protected name: string, accessory: PlatformAccessory<AutomowerContext>, api: API, protected log: PlatformLogger) {
        super(accessory, api);
    }
    
    public getUnderlyingService(): Service | undefined {
        return this.switchService;
    }    

    public init(mode: NameMode): void {
        this.switchService = this.accessory.getServiceById(this.Service.Switch, this.name);
        if (this.switchService === undefined) {
            const displayName = this.getDisplayName(mode);

            this.switchService = this.createService(displayName);
            this.accessory.addService(this.switchService);
        }

        this.on = this.switchService.getCharacteristic(this.Characteristic.On)
            .on(CharacteristicEventTypes.SET, this.onSetCallback.bind(this));
        this.statusActive = this.switchService.getCharacteristic(this.Characteristic.StatusActive);
    }

    public setMowerMetadata(metadata: MowerMetadata): void {
        if (this.statusActive === undefined) {
            throw new Error('The service has not been initialized.');
        }

        this.statusActive.updateValue(metadata.connected);
    }
    
    protected getDisplayName(mode: NameMode): string {
        if (mode === NameMode.DISPLAY_NAME) {
            return this.accessory.displayName;
        }

        return this.name;
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