import { AutomowerAccessory } from '../../src/automowerAccessory';
import { AccessoryServiceImpl } from '../../src/services/accessoryService';

export class AccessoryServiceImplSpy extends AccessoryServiceImpl {
    public newAccessory?: AutomowerAccessory;

    public override createAutomowerAccessory(): AutomowerAccessory {
        return this.newAccessory!;    
    }
}