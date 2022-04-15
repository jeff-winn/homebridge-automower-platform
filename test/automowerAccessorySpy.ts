import { AutomowerAccessory } from '../src/automowerAccessory';

export class AutomowerAccessorySpy extends AutomowerAccessory {
    shouldRun = true;
    accessoryInformationInitialized = false;

    protected override initAccessoryInformation(): void {
        this.accessoryInformationInitialized = true;

        if (this.shouldRun) {
            super.initAccessoryInformation();        
        }
    }

    unsafeInitAccessoryInformation(): void {
        this.initAccessoryInformation();
    }
}