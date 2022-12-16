import {
    API, Characteristic, CharacteristicEventTypes, CharacteristicSetCallback,
    CharacteristicValue, HAPStatus, PlatformAccessory, Service
} from 'homebridge';

import { AutomowerContext } from '../automowerAccessory';
import { PlatformLogger } from '../diagnostics/platformLogger';
import { Calendar, MowerState, Planner } from '../model';
import { AbstractSwitch, Switch } from './homebridge/abstractSwitch';
import { ChangeSettingsService } from './husqvarna/automower/changeSettingsService';
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
     * Sets the mower cutting height.
     * @param value The cutting height.
     */
    setCuttingHeight(value: number): void;
}

export class ScheduleSwitchImpl extends AbstractSwitch implements ScheduleSwitch {
    private cuttingHeight?: Characteristic;

    public constructor(name: string, private controlService: MowerControlService, private settingsService: ChangeSettingsService, private policy: ScheduleEnabledPolicy, 
        accessory: PlatformAccessory<AutomowerContext>, api: API, log: PlatformLogger) {
        super(name, accessory, api, log);
    }

    protected override onInit(service: Service): void {
        super.onInit(service);

        if (service.testCharacteristic(this.CustomCharacteristic.CuttingHeight)) {
            this.cuttingHeight = service.getCharacteristic(this.CustomCharacteristic.CuttingHeight);
        } else {
            this.cuttingHeight = service.addCharacteristic(this.CustomCharacteristic.CuttingHeight);
        }

        this.cuttingHeight.on(CharacteristicEventTypes.SET, this.onSetCuttingHeightCallback.bind(this));
    }

    protected onSetCuttingHeightCallback(value: CharacteristicValue, callback: CharacteristicSetCallback): Promise<void> {
        const actualValue = value as number;
        return this.onSetCuttingHeight(actualValue, callback);
    }

    protected async onSetCuttingHeight(value: number, callback: CharacteristicSetCallback): Promise<void> {
        try {
            await this.settingsService.changeCuttingHeight(this.accessory.context.mowerId, value as number);

            callback(HAPStatus.SUCCESS);
        } catch (e) {
            this.log.error('ERROR_HANDLING_SET', this.cuttingHeight!.displayName, this.accessory.displayName, e);

            callback(HAPStatus.SERVICE_COMMUNICATION_FAILURE);
        }
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
            this.log.error('ERROR_HANDLING_SET', this.name, this.accessory.displayName, e);

            callback(HAPStatus.SERVICE_COMMUNICATION_FAILURE);
        }        
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

    public setCuttingHeight(value: number): void {
        if (this.cuttingHeight === undefined) {
            throw new Error('The service has not been initialized.');
        }

        this.cuttingHeight.updateValue(value);
        this.log.info('CHANGED_VALUE', this.cuttingHeight.displayName, this.accessory.displayName, value);
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