import { API, Characteristic, PlatformAccessory } from 'homebridge';

import { AutomowerContext } from '../automowerAccessory';
import { PlatformLogger } from '../diagnostics/platformLogger';
import { MowerMetadata, MowerState } from '../model';
import { AbstractContactSensor, ContactSensor } from './homebridge/abstractContactSensor';
import { MowerIsLeavingPolicy } from './policies/mowerIsLeavingPolicy';

/**
 * A sensor which identifies whether the mower is leaving the charge station.
 */
export interface LeavingSensor extends ContactSensor {
    /**
     * Sets the state whether the motion is detected.
     * @param mower The state of the mower.
     */
     setMowerState(mower: MowerState): void;

    /**
     * Sets the mower metadata.
     * @param metadata The metadata.
     */
    setMowerMetadata(metadata: MowerMetadata): void;
}

/**
 * An {@link LeavingSensor} which uses an underlying contact sensor service.
 */
export class LeavingContactSensorImpl extends AbstractContactSensor implements LeavingSensor {
    private statusActive?: Characteristic;

    public constructor(protected name: string, protected policy: MowerIsLeavingPolicy, 
        protected accessory: PlatformAccessory<AutomowerContext>, protected api: API, protected log: PlatformLogger) {
        super(name, policy, accessory, api, log);
    }

    public init(): void {
        super.init();

        this.statusActive = this.getUnderlyingService()!.getCharacteristic(this.Characteristic.StatusActive);
    }

    public setMowerState(mower: MowerState): void {
        this.policy.setMowerState(mower);
        this.refreshCharacteristic();
    }

    public setMowerMetadata(metadata: MowerMetadata): void {
        if (this.statusActive === undefined) {
            throw new Error('The service has not been initialized.');
        }

        this.statusActive.updateValue(metadata.connected);
    }
}