import { API, Characteristic, PlatformAccessory, Service } from 'homebridge';
import { AutomowerContext } from '../automowerAccessory';
import { InvalidStateError } from '../errors/invalidStateError';
import { MowerState } from '../model';
import { AbstractAccessoryService } from './abstractAccessoryService';
import { MowerInMotionPolicy } from './policies/mowerInMotionPolicy';

/**
 * A service which encapsulates whether the motion detection service for a mower.
 */
export interface MotionSensorService {
    /**
     * Initializes the service.
     */
    init(prepend: boolean): void;

    /**
     * Sets the state whether the motion is detected.
     * @param mower The state of the mower.
     */
    setMowerState(mower: MowerState): void;
}

export class MotionSensorServiceImpl extends AbstractAccessoryService implements MotionSensorService {
    private underlyingService?: Service;
    private motionDetected?: Characteristic;

    private lastValue?: boolean;

    public constructor(private name: string, private policy: MowerInMotionPolicy, 
        accessory: PlatformAccessory<AutomowerContext>, api: API) { 
        super(accessory, api);
    }

    public init(prepend: boolean): void {
        this.underlyingService = this.accessory.getServiceById(this.Service.MotionSensor, this.name);
        if (this.underlyingService === undefined) {
            let displayName = this.name;
            if (prepend) {
                displayName = `${this.accessory.displayName} ${this.name}`;
            }

            this.underlyingService = this.createService(displayName);
            this.accessory.addService(this.underlyingService);
        }

        this.motionDetected = this.underlyingService.getCharacteristic(this.Characteristic.MotionDetected);
    }

    protected createService(displayName: string): Service {
        return new this.Service.MotionSensor(displayName, this.name);
    }

    public setMowerState(mower: MowerState): void {        
        this.policy.setMowerState(mower);
        this.refreshCharacteristic();
    }

    protected refreshCharacteristic(): void {
        if (this.motionDetected === undefined) {
            throw new InvalidStateError('The service has not been initialized.');
        }

        const newValue = this.policy.check();
        if (this.lastValue === undefined || this.lastValue !== newValue) {
            this.motionDetected.updateValue(newValue);
            this.lastValue = newValue;
        }
    }

    protected getLastValue(): boolean | undefined {
        return this.lastValue;
    }

    protected setLastValue(value: boolean | undefined): void {
        this.lastValue = value;
    }
}