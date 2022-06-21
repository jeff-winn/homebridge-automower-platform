import { API, Characteristic, PlatformAccessory, Service } from 'homebridge';

import { AutomowerContext } from '../automowerAccessory';
import { PlatformLogger } from '../diagnostics/platformLogger';
import { InvalidStateError } from '../errors/invalidStateError';
import { MowerState } from '../model';
import { AbstractAccessoryService } from './abstractAccessoryService';
import { MowerFaultedPolicy } from './policies/mowerFaultedPolicy';
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
    private faulted?: Characteristic;

    private lastFaultedValue?: boolean;
    private lastMotionValue?: boolean;

    public constructor(private name: string, private motionPolicy: MowerInMotionPolicy, private faultedPolicy: MowerFaultedPolicy,
        accessory: PlatformAccessory<AutomowerContext>, api: API, private log: PlatformLogger) { 
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
        this.faulted = this.underlyingService.getCharacteristic(this.Characteristic.StatusFault);
    }

    protected createService(displayName: string): Service {
        return new this.Service.MotionSensor(displayName, this.name);
    }

    public setMowerState(mower: MowerState): void {        
        this.motionPolicy.setMowerState(mower);
        this.faultedPolicy.setMowerState(mower);

        this.refreshCharacteristics();
    }

    protected refreshCharacteristics(): void {
        this.checkFaulted();
        this.checkMotionDetected();
    }

    protected checkFaulted(): void {
        if (this.faulted === undefined) {
            throw new InvalidStateError('The service has not been initialized.');
        }

        const newValue = this.faultedPolicy.check();
        if (this.lastFaultedValue === undefined || this.lastFaultedValue !== newValue) {
            this.log.info(`Changed '${this.name}' for '${this.accessory.displayName}': ${newValue ? 'GENERAL_FAULT' : 'NO_FAULT'}`);

            this.faulted.updateValue(newValue ? this.Characteristic.StatusFault.GENERAL_FAULT : this.Characteristic.StatusFault.NO_FAULT);
            this.setLastFaultedValue(newValue);
        }
    }

    protected getLastFaultedValue(): boolean | undefined {
        return this.lastFaultedValue;        
    }

    protected setLastFaultedValue(value: boolean | undefined) {
        this.lastFaultedValue = value;
    }

    protected checkMotionDetected(): void {
        if (this.motionDetected === undefined) {
            throw new InvalidStateError('The service has not been initialized.');
        }

        const newValue = this.motionPolicy.check();
        if (this.lastMotionValue === undefined || this.lastMotionValue !== newValue) {
            this.log.info(`Changed '${this.name}' for '${this.accessory.displayName}': ${newValue ? 'MOTION_DETECTED' : 'NO_MOTION'}`);

            this.motionDetected.updateValue(newValue);
            this.setLastMotionValue(newValue);
        }
    }

    protected getLastMotionValue(): boolean | undefined {
        return this.lastMotionValue;
    }

    protected setLastMotionValue(value: boolean | undefined): void {
        this.lastMotionValue = value;
    }
}