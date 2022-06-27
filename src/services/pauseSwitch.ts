import { API, CharacteristicSetCallback, HAPStatus, PlatformAccessory } from 'homebridge';
import { AutomowerContext } from '../automowerAccessory';
import { PlatformLogger } from '../diagnostics/platformLogger';
import { MowerState } from '../model';
import { AbstractSwitch, Switch } from './abstractSwitch';
import { MowerControlService } from './automower/mowerControlService';
import { MowerIsPausedPolicy } from './policies/mowerIsPausedPolicy';

/**
 * A switch which controls whether a mower is paused.
 */
export interface PauseSwitch extends Switch {
    /**
     * Sets the state of the mower.
     * @param state The mower state.
     */
    setMowerState(state: MowerState): void;
}

export class PauseSwitchImpl extends AbstractSwitch implements PauseSwitch {
    public constructor(name: string, private controlService: MowerControlService, private policy: MowerIsPausedPolicy, 
        accessory: PlatformAccessory<AutomowerContext>, api: API, log: PlatformLogger) {
        super(name, accessory, api, log);
    }

    protected async onSet(on: boolean, callback: CharacteristicSetCallback): Promise<void> {
        try {
            if (on) {
                await this.controlService.pause(this.accessory.context.mowerId);
            } else {
                await this.controlService.resumeSchedule(this.accessory.context.mowerId);
            }    

            callback(HAPStatus.SUCCESS);
        } catch (e) {
            this.log.error('An unexpected error occurred while attempting to set \'%s\' for \'%s\'.', 
                this.name, this.accessory.displayName, e);

            callback(HAPStatus.SERVICE_COMMUNICATION_FAILURE);
        }        
    }
    
    public setMowerState(state: MowerState): void {
        this.policy.setMowerState(state);
        this.refreshCharacteristic();
    }

    /**
     * Refreshes the characteristic value based on the deterministic calculation of whether the schedule is currently enabled.
     */
    protected refreshCharacteristic() {
        const newValue = this.policy.check();
        this.updateValue(newValue);
    }
}