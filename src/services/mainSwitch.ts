import {
    API, Characteristic, CharacteristicEventTypes, CharacteristicSetCallback,
    CharacteristicValue, HAPStatus, PlatformAccessory, Service
} from 'homebridge';

import { PlatformLogger } from '../diagnostics/platformLogger';
import { MowerSchedule, MowerState } from '../model';
import { MowerContext } from '../mowerAccessory';
import { AbstractSwitch, Switch } from './homebridge/abstractSwitch';
import { attachCuttingHeightCharacteristic } from './homebridge/characteristics/cuttingHeight';
import { ChangeSettingsService } from './husqvarna/automower/changeSettingsService';
import { MowerControlService } from './husqvarna/mowerControlService';
import { MowerIsEnabledPolicy } from './policies/mowerIsEnabledPolicy';

/**
 * A service which encapsulates the main switch for a mower device.
 */
export interface MainSwitch extends Switch {
    /**
     * Sets the state of the mower.
     * @param state The mower state.
     */
    setMowerState(state: MowerState): void;    
}

/**
 * A service which supports the cutting height characteristic.
 */
export interface SupportsCuttingHeightCharacteristic {
    /**
     * Sets the mower cutting height.
     * @param value The cutting height.
     */
    setCuttingHeight(value: number): void;
}

/**
 * Identifies if the object implements {@link SupportsCuttingHeightCharacteristic}.
 * @param object The object to test.
 * @returns true if the object is {@link SupportsCuttingHeightCharacteristic}.
 */
export function supportsCuttingHeight(object: unknown): object is SupportsCuttingHeightCharacteristic {
    return (<SupportsCuttingHeightCharacteristic>object).setCuttingHeight !== undefined;
}

/**
 * Identifies a policy as supporting mower schedule information.
 */
export interface SupportsMowerScheduleInformation {
    /**
     * Sets the schedule.
     * @param schedule The mower schedule.
     */
    setMowerSchedule(schedule: MowerSchedule): void;
}

/**
 * Identifies if the object implements {@link SupportsMowerScheduleInformation}.
 * @param object The object to test.
 * @returns true if the object is {@link SupportsMowerScheduleInformation}.
 */
export function supportsMowerSchedule(object: unknown): object is SupportsMowerScheduleInformation {
    return (<SupportsMowerScheduleInformation>object).setMowerSchedule !== undefined;
}

/**
 * Represents the main switch of a mower device.
 */
export class MainSwitchImpl extends AbstractSwitch implements MainSwitch, SupportsMowerScheduleInformation {
    public constructor(name: string, private controlService: MowerControlService, private policy: MowerIsEnabledPolicy, 
        accessory: PlatformAccessory<MowerContext>, api: API, log: PlatformLogger) {
        super(name, accessory, api, log);
    }

    protected override async onSetCallbackAsync(on: boolean, callback: CharacteristicSetCallback): Promise<void> {
        try {
            if (on) {
                await this.controlService.resumeAsync(this.accessory.context.mowerId);
            } else {
                await this.controlService.parkUntilFurtherNoticeAsync(this.accessory.context.mowerId);
            }    

            callback(HAPStatus.SUCCESS);
        } catch (e) {
            callback(HAPStatus.SERVICE_COMMUNICATION_FAILURE);            
            throw e;
        }        
    }

    public setMowerSchedule(schedule: MowerSchedule): void {
        if (!supportsMowerSchedule(this.policy)) {
            return;
        }

        this.policy.setMowerSchedule(schedule);
        this.refreshCharacteristic();
    }

    public setMowerState(state: MowerState): void {
        this.policy.setMowerState(state);
        this.refreshCharacteristic();
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

/**
 * Represents the main switch of an Automower device.
 */
export class AutomowerMainSwitchImpl extends MainSwitchImpl implements SupportsCuttingHeightCharacteristic {
    private cuttingHeight?: Characteristic;

    public constructor(name: string, controlService: MowerControlService, private settingsService: ChangeSettingsService, policy: MowerIsEnabledPolicy, 
        accessory: PlatformAccessory<MowerContext>, api: API, log: PlatformLogger) {
        super(name, controlService, policy, accessory, api, log);
    }

    protected override onInit(service: Service): void {
        super.onInit(service);

        this.cuttingHeight = attachCuttingHeightCharacteristic(service, this.api);
        this.cuttingHeight.on(CharacteristicEventTypes.SET, this.onSetCuttingHeightCallback.bind(this));
    }    

    public setCuttingHeight(value: number): void {
        if (this.cuttingHeight === undefined) {
            throw new Error('The service has not been initialized.');
        }

        this.cuttingHeight.updateValue(value);
        this.log.info('CHANGED_VALUE', this.cuttingHeight.displayName, this.accessory.displayName, value);
    }

    protected onSetCuttingHeightCallback(value: CharacteristicValue, callback: CharacteristicSetCallback): void {
        const actualValue = value as number;

        this.onSetCuttingHeightCallbackAsync(actualValue, callback).then()
            .catch(err => {
                this.log.error('ERROR_HANDLING_SET', this.cuttingHeight!.displayName, this.accessory.displayName, err);
            });
    }

    protected async onSetCuttingHeightCallbackAsync(value: number, callback: CharacteristicSetCallback): Promise<void> {
        try {
            await this.settingsService.changeCuttingHeightAsync(this.accessory.context.mowerId, value);

            callback(HAPStatus.SUCCESS);
        } catch (e) {
            callback(HAPStatus.SERVICE_COMMUNICATION_FAILURE);
            throw e;
        }
    }
}