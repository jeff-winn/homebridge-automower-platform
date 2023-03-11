import {
    API, Characteristic, CharacteristicEventTypes, CharacteristicSetCallback,
    CharacteristicValue, HAPStatus, PlatformAccessory, Service
} from 'homebridge';

import { MowerContext } from '../automowerAccessory';
import { PlatformLogger } from '../diagnostics/platformLogger';
import { MowerState } from '../model';
import { AbstractSwitch, Switch } from './homebridge/abstractSwitch';
import { attachCuttingHeightCharacteristic } from './homebridge/characteristics/cuttingHeight';
import { ChangeSettingsService } from './husqvarna/automower/changeSettingsService';
import { MowerControlService } from './husqvarna/mowerControlService';
import { MowerIsEnabledPolicy } from './policies/mowerIsEnabledPolicy';

/**
 * A service which encapsulates the primary switch for a mower.
 */
export interface MainSwitch extends Switch {
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

export class MainSwitchImpl extends AbstractSwitch implements MainSwitch {
    private cuttingHeight?: Characteristic;

    public constructor(name: string, private controlService: MowerControlService, private settingsService: ChangeSettingsService, private policy: MowerIsEnabledPolicy, 
        accessory: PlatformAccessory<MowerContext>, api: API, log: PlatformLogger) {
        super(name, accessory, api, log);
    }

    protected override onInit(service: Service): void {
        super.onInit(service);

        this.cuttingHeight = attachCuttingHeightCharacteristic(service, this.api);
        this.cuttingHeight.on(CharacteristicEventTypes.SET, this.onSetCuttingHeightCallback.bind(this));
    }

    protected onSetCuttingHeightCallback(value: CharacteristicValue, callback: CharacteristicSetCallback): Promise<void> {
        const actualValue = value as number;
        return this.onSetCuttingHeight(actualValue, callback);
    }

    protected async onSetCuttingHeight(value: number, callback: CharacteristicSetCallback): Promise<void> {
        try {
            await this.settingsService.changeCuttingHeight(this.accessory.context.mowerId, value);

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