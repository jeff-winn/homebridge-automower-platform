import { AutomowerAccessory } from '../../src/automowerAccessory';
import { AutomowerAccessoryFactoryImpl } from '../../src/services/automowerAccessoryFactory';

export class AutomowerAccessoryFactoryImplSpy extends AutomowerAccessoryFactoryImpl {
    public newAccessory?: AutomowerAccessory;

    public override createAutomowerAccessory(): AutomowerAccessory {
        return this.newAccessory!;    
    }
}