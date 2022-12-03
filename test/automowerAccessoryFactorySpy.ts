import { PlatformAccessory } from 'homebridge';
import { AutomowerAccessory, AutomowerContext } from '../src/automowerAccessory';
import { AutomowerAccessoryFactoryImpl } from '../src/automowerAccessoryFactory';

export class AutomowerAccessoryFactorySpy extends AutomowerAccessoryFactoryImpl {
    private accessory?: AutomowerAccessory;

    public setAccessory(accessory: AutomowerAccessory): void {
        this.accessory = accessory;
    }

    protected createAutomowerAccessoryImpl(accessory: PlatformAccessory<AutomowerContext>): AutomowerAccessory {
        if (this.accessory !== undefined) {
            return this.accessory;
        }

        return super.createAutomowerAccessoryImpl(accessory);
    }
}