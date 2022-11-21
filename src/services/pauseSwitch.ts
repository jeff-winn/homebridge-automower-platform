import { API, Characteristic, CharacteristicSetCallback, HAPStatus, PlatformAccessory } from 'homebridge';
import { AutomowerContext } from '../automowerAccessory';
import { PlatformLogger } from '../diagnostics/platformLogger';
import { Activity, MowerMetadata, MowerState, State } from '../model';
import { AbstractSwitch, NameMode, Switch } from './homebridge/abstractSwitch';
import { MowerControlService } from './husqvarna/automower/mowerControlService';
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

    /**
     * Sets the mower metadata.
     * @param metadata The metadata.
     */
    setMowerMetadata(metadata: MowerMetadata): void;
}

export class PauseSwitchImpl extends AbstractSwitch implements PauseSwitch {
    private statusActive?: Characteristic;
    private lastActivity?: Activity;

    public constructor(name: string, private controlService: MowerControlService, private policy: MowerIsPausedPolicy, 
        accessory: PlatformAccessory<AutomowerContext>, api: API, log: PlatformLogger) {
        super(name, accessory, api, log);
    }

    public init(mode: NameMode): void {
        super.init(mode);

        this.statusActive = this.getUnderlyingService()!.getCharacteristic(this.Characteristic.StatusActive);
    }

    public getLastActivity(): Activity | undefined {
        return this.lastActivity;
    }

    public setMowerMetadata(metadata: MowerMetadata): void {
        if (this.statusActive === undefined) {
            throw new Error('The service has not been initialized.');
        }

        this.statusActive.updateValue(metadata.connected);
    }

    protected async onSet(on: boolean, callback: CharacteristicSetCallback): Promise<void> {
        try {
            if (on) {
                await this.controlService.pause(this.accessory.context.mowerId);
            } else {
                if (this.shouldParkMowerUntilFurtherNotice()) {
                    await this.controlService.parkUntilFurtherNotice(this.accessory.context.mowerId);
                } else {
                    await this.controlService.resumeSchedule(this.accessory.context.mowerId);
                }                
            }    

            callback(HAPStatus.SUCCESS);
        } catch (e) {
            this.log.error('An unexpected error occurred while attempting to set \'%s\' for \'%s\'.', 
                this.name, this.accessory.displayName, e);

            callback(HAPStatus.SERVICE_COMMUNICATION_FAILURE);
        }        
    }

    protected shouldParkMowerUntilFurtherNotice(): boolean {
        return this.lastActivity !== undefined && this.lastActivity === Activity.GOING_HOME;
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

        this.lastActivity = state.activity;
    }

    /**
     * Refreshes the characteristic value based on the deterministic calculation of whether the mower is paused.
     */
    protected refreshCharacteristic() {
        const newValue = this.policy.check();
        this.updateValue(newValue);
    }
}