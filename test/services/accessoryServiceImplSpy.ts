import { AutomowerAccessory } from '../../src/automowerAccessory';
import { AccessoryServiceImpl } from '../../src/services/accessoryService';

export class AccessoryServiceImplSpy extends AccessoryServiceImpl {
    newAccessory?: AutomowerAccessory;

    protected createAutomowerAccessory(): AutomowerAccessory {
        return this.newAccessory!;    
    }
}