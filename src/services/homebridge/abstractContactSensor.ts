import { API, Characteristic, PlatformAccessory, Service } from 'homebridge';

import { AutomowerContext } from '../../automowerAccessory';
import { PlatformLogger } from '../../diagnostics/platformLogger';
import { Policy } from '../policies/policy';
import { AbstractAccessoryService } from './abstractAccessoryService';

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
export interface ContactSensor {
    /**
     * Initializes the sensor.
     */
     init(): void;
}

/**
 * A base implementation of a contact sensor.
 */
export abstract class AbstractContactSensor extends AbstractAccessoryService implements ContactSensor {
    private underlyingService?: Service;
    private contactState?: Characteristic;

    private lastValue?: number;

    public constructor(protected name: string, protected policy: Policy, protected accessory: PlatformAccessory<AutomowerContext>, 
        protected api: API, protected log: PlatformLogger) {
        super(accessory, api);
    }    
    
    public init(): void {
        this.underlyingService = this.accessory.getServiceById(this.Service.ContactSensor, this.name);
        if (this.underlyingService === undefined) {
            this.underlyingService = this.createService(this.name);
            this.accessory.addService(this.underlyingService);
        }

        this.contactState = this.underlyingService.getCharacteristic(this.Characteristic.ContactSensorState);
    }

    protected createService(displayName: string): Service {
        return new this.Service.ContactSensor(displayName, this.name);
    }

    /**
     * Refreshes the characteristic.
     */
    protected refreshCharacteristic(): void {
        if (this.contactState === undefined) {
            throw new Error('The sensor has not been initialized.');
        }

        const lastValue = this.getLastValue();
        const newValue = this.getContactSensorState();

        if (lastValue === undefined || lastValue !== newValue) {
            this.log.info(`Changed '%s' for '%s': ${newValue === CONTACT_SENSOR_OPEN ? 'OPEN' : 'CLOSED'}`, 
                this.name, this.accessory.displayName);

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
}