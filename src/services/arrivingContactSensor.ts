import { API, Characteristic, PlatformAccessory, Service } from 'homebridge';
import { AutomowerContext } from '../automowerAccessory';
import { PlatformLogger } from '../diagnostics/platformLogger';
import { MowerState } from '../model';
import { AbstractAccessoryService } from './abstractAccessoryService';
import { MowerIsArrivingPolicy } from './policies/mowerIsArrivingPolicy';

/**
 * A sensor which identifies whether the mower is arriving to the charge station.
 */
export interface ArrivingContactSensor {
    /**
     * Initializes the sensor.
     */
    init(): void;

    /**
     * Sets the state whether the motion is detected.
     * @param mower The state of the mower.
     */
     setMowerState(mower: MowerState): void;
}

export class ArrivingContactSensorImpl extends AbstractAccessoryService implements ArrivingContactSensor {    
    private underlyingService?: Service;
    private contactState?: Characteristic;
    
    private lastValue?: boolean;

    public constructor(private name: string, private policy: MowerIsArrivingPolicy, accessory: PlatformAccessory<AutomowerContext>, 
        api: API, protected log: PlatformLogger) {
        super(accessory, api);
    }    

    public getUnderlyingService(): Service | undefined {
        return this.underlyingService;
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

    public setMowerState(mower: MowerState): void {
        this.policy.setMowerState(mower);
        this.refreshCharacteristic();
    }

    protected refreshCharacteristic(): void {
        if (this.contactState === undefined) {
            throw new Error('The sensor has not been initialized.');
        }

        const lastValue = this.getLastValue();
        const newValue = this.policy.check();

        if (lastValue === undefined || lastValue !== newValue) {
            this.log.info(`Changed '%s' for '%s': ${newValue ? 'CONTACT_DETECTED' : 'CONTACT_NOT_DETECTED'}`, 
                this.name, this.accessory.displayName);

            const actualValue = newValue ? 
                this.Characteristic.ContactSensorState.CONTACT_DETECTED : 
                this.Characteristic.ContactSensorState.CONTACT_NOT_DETECTED;

            this.contactState.updateValue(actualValue);
            this.setLastValue(newValue);
        }
    }

    protected getLastValue(): boolean | undefined {
        return this.lastValue;
    }

    protected setLastValue(value: boolean | undefined): void {
        this.lastValue = value;
    }
}