import { AutomowerAccessory } from '../../src/automowerAccessory';
import { AccessoryFactoryImpl } from '../../src/services/accessoryFactory';

export class AccessoryFactoryImplSpy extends AccessoryFactoryImpl {
    public newAccessory?: AutomowerAccessory;

    public override createAutomowerAccessory(): AutomowerAccessory {
        return this.newAccessory!;    
    }
}