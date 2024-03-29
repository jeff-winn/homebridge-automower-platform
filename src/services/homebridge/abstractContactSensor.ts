import { API, Characteristic, PlatformAccessory, Service } from 'homebridge';

import { PlatformLogger } from '../../diagnostics/platformLogger';
import { MowerConnection } from '../../model';
import { MowerContext } from '../../mowerAccessory';
import { Policy } from '../policies/policy';
import { AbstractAccessoryService, SupportDisable } from './abstractAccessoryService';

/**
 * Defines the value which indicates the contact sensor is open.
 */
export const CONTACT_SENSOR_OPEN = 1;

/**
 * Defines the value which indicates the contact sensor is closed.
 */
export const CONTACT_SENSOR_CLOSED = 0;

/**
 * Identifies a contact sensor.
 */
export interface ContactSensor extends SupportDisable {
    /**
     * Initializes the sensor.
     */
     init(): void;

    /**
     * Sets the mower connection.
     * @param connection The mower connection.
     */
    setMowerConnection(connection: MowerConnection): void;
}

/**
 * A base implementation of a contact sensor.
 */
export abstract class AbstractContactSensor extends AbstractAccessoryService implements ContactSensor {
    private underlyingService?: Service;
    private contactState?: Characteristic;
    private statusActive?: Characteristic;

    private lastValue?: number;
    private disabled = false;

    public constructor(protected name: string, protected policy: Policy, protected accessory: PlatformAccessory<MowerContext>, 
        protected api: API, protected log: PlatformLogger) {
        super(accessory, api);
    }
    
    public getUnderlyingService(): Service | undefined {
        return this.underlyingService;
    }
    
    public init(): void {
        this.underlyingService = this.accessory.getServiceById(this.Service.ContactSensor, this.name);
        if (this.isDisabled()) {
            if (this.underlyingService !== undefined) {
                this.accessory.removeService(this.underlyingService);
            }
            
            return;
        }

        if (this.underlyingService === undefined) {
            this.underlyingService = this.createService(this.name);
            this.underlyingService.setCharacteristic(this.Characteristic.ConfiguredName, this.name);

            this.accessory.addService(this.underlyingService);
        }

        this.contactState = this.underlyingService.getCharacteristic(this.Characteristic.ContactSensorState);
        this.statusActive = this.underlyingService.getCharacteristic(this.Characteristic.StatusActive);
    }

    public disable(): void {
        this.disabled = true;
    }

    public isDisabled(): boolean {
        return this.disabled;
    }

    protected createService(displayName: string): Service {
        return new this.Service.ContactSensor(displayName, this.name);
    }

    /**
     * Refreshes the characteristic.
     */
    protected refreshCharacteristic(): void {
        if (this.contactState === undefined) {
            return;
        }

        const lastValue = this.getLastValue();
        const newValue = this.getContactSensorState();

        if (lastValue === undefined || lastValue !== newValue) {
            this.log.info('CHANGED_VALUE', this.name, this.accessory.displayName, 
                newValue === CONTACT_SENSOR_OPEN ? 'OPEN' : 'CLOSED');

            this.contactState.updateValue(newValue);
            this.setLastValue(newValue);
        }
    }
    
    /**
     * Gets the last value (or undefined) of the sensor state.
     * @returns The value.
     */
    protected getLastValue(): number | undefined {
        return this.lastValue;
    }

    /**
     * Sets the last value (or undefined) of the sensor state.
     * @param value The value.
     */
    protected setLastValue(value: number | undefined): void {
        this.lastValue = value;
    }

    private getContactSensorState(): number {
        const newValue = this.policy.check();
        return newValue ? CONTACT_SENSOR_OPEN : CONTACT_SENSOR_CLOSED;
    }

    public setMowerConnection(connection: MowerConnection): void {
        if (this.statusActive === undefined) {
            return;
        }

        this.statusActive.updateValue(connection.connected);
    }
}