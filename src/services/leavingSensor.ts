import { API, PlatformAccessory } from 'homebridge';

import { PlatformLogger } from '../diagnostics/platformLogger';
import { MowerState } from '../model';
import { MowerContext } from '../mowerAccessory';
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
}

/**
 * An {@link LeavingSensor} which uses an underlying contact sensor service.
 */
export class LeavingContactSensorImpl extends AbstractContactSensor implements LeavingSensor {
    public constructor(protected name: string, protected policy: MowerIsLeavingPolicy, 
        protected accessory: PlatformAccessory<MowerContext>, protected api: API, protected log: PlatformLogger) {
        super(name, policy, accessory, api, log);
    }

    public setMowerState(mower: MowerState): void {
        this.policy.setMowerState(mower);
        this.refreshCharacteristic();
    }
}