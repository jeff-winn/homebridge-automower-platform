import { API, CharacteristicSetCallback, HAPStatus, PlatformAccessory } from 'homebridge';

import { PlatformLogger } from '../diagnostics/platformLogger';
import { Activity, MowerState, State } from '../model';
import { MowerContext } from '../mowerAccessory';
import { AbstractSwitch, Switch } from './homebridge/abstractSwitch';
import { MowerControlService, SupportsPauseControl } from './husqvarna/mowerControlService';
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
    private lastState?: MowerState;

    public constructor(name: string, private controlService: MowerControlService & SupportsPauseControl, private policy: MowerIsPausedPolicy, 
        accessory: PlatformAccessory<MowerContext>, api: API, log: PlatformLogger) {
        super(name, accessory, api, log);
    }

    public getLastState(): MowerState | undefined {
        return this.lastState;
    }
    
    protected async onSet(on: boolean, callback: CharacteristicSetCallback): Promise<void> {
        try {
            if (on) {
                await this.controlService.pause(this.accessory.context.mowerId);
            } else {
                if (this.shouldPark()) {
                    await this.controlService.park(this.accessory.context.mowerId);
                } else {
                    await this.controlService.resume(this.accessory.context.mowerId);
                }                
            }    

            callback(HAPStatus.SUCCESS);
        } catch (e) {
            this.log.error('ERROR_HANDLING_SET', this.name, this.accessory.displayName, e);

            callback(HAPStatus.SERVICE_COMMUNICATION_FAILURE);
        }        
    }

    protected shouldPark(): boolean {
        return this.lastState !== undefined && 
            this.lastState.activity === Activity.MOWING && this.lastState.state === State.GOING_HOME;
    }
    
    public setMowerState(state: MowerState): void {
        this.policy.setMowerState(state);
        this.refreshLastActivity(state);
        
        this.refreshCharacteristic();
    }

    protected refreshLastActivity(state: MowerState): void {
        if (state.state === State.PAUSED) {
            // Do not update the last activity because pause was enabled.
            return;
        }

        this.lastState = state;
    }

    /**
     * Refreshes the characteristic value based on the deterministic calculation of whether the mower is paused.
     */
    protected refreshCharacteristic() {
        const newValue = this.policy.check();
        this.updateValue(newValue);
    }
}