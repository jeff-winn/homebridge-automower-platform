import {
    API, Characteristic, CharacteristicSetCallback,
    HAPStatus, PlatformAccessory
} from 'homebridge';

import { AutomowerContext } from '../automowerAccessory';
import { PlatformLogger } from '../diagnostics/platformLogger';
import { Calendar, MowerMetadata, MowerState, Planner } from '../model';
import { AbstractSwitch, NameMode, Switch } from './homebridge/abstractSwitch';
import { MowerControlService } from './husqvarna/automower/mowerControlService';
import { ScheduleEnabledPolicy } from './policies/scheduleEnabledPolicy';

/**
 * A service which encapsulates the schedule switch for an automower.
 */
export interface ScheduleSwitch extends Switch {
    /**
     * Sets the calendar.
     * @param calendar The calendar.
     */
    setCalendar(calendar: Calendar): void;

    /**
     * Sets the planner.
     * @param planner The planner.
     */
    setPlanner(planner: Planner): void;

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

export class ScheduleSwitchImpl extends AbstractSwitch implements ScheduleSwitch {
    private statusActive?: Characteristic;

    public constructor(name: string, private controlService: MowerControlService, private policy: ScheduleEnabledPolicy, 
        accessory: PlatformAccessory<AutomowerContext>, api: API, log: PlatformLogger) {
        super(name, accessory, api, log);
    }

    protected async onSet(on: boolean, callback: CharacteristicSetCallback): Promise<void> {
        try {
            if (on) {
                await this.controlService.resumeSchedule(this.accessory.context.mowerId);
            } else {
                await this.controlService.parkUntilFurtherNotice(this.accessory.context.mowerId);
            }    

            callback(HAPStatus.SUCCESS);
        } catch (e) {
            this.log.error('An unexpected error occurred while attempting to set \'%s\' for \'%s\'.', 
                this.name, this.accessory.displayName, e);

            callback(HAPStatus.SERVICE_COMMUNICATION_FAILURE);
        }        
    }

    public init(mode: NameMode): void {
        super.init(mode);

        this.statusActive = this.getUnderlyingService()!.getCharacteristic(this.Characteristic.StatusActive);
    }

    public setCalendar(calendar: Calendar): void {    
        this.policy.setCalendar(calendar);
        this.refreshCharacteristic();
    }

    public setPlanner(planner: Planner): void {
        this.policy.setPlanner(planner);
        this.refreshCharacteristic();
    }

    public setMowerState(state: MowerState): void {
        this.policy.setMowerState(state);
        this.refreshCharacteristic();
    }

    public setMowerMetadata(metadata: MowerMetadata): void {
        if (this.statusActive === undefined) {
            throw new Error('The service has not been initialized.');
        }

        this.statusActive.updateValue(metadata.connected);
    }

    /**
     * Refreshes the characteristic value based on the deterministic calculation of whether the schedule is currently enabled.
     */
    protected refreshCharacteristic() {
        if (this.policy.shouldApply()) {
            const newValue = this.policy.check();
            this.updateValue(newValue);        
        }
    }
}