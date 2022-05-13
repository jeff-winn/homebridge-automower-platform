import { API, Characteristic, PlatformAccessory, Service } from 'homebridge';
import { AutomowerContext } from '../automowerAccessory';

import { AccessoryService } from './accessoryService';
import { MowerControlService } from './automower/mowerControlService';

/**
 * A service which manages the schedule enablement of an automower.
 */
export interface ScheduleService {
    /**
     * Initializes the service.
     */
    init(): void;
}

export class ScheduleServiceImpl extends AccessoryService implements ScheduleService {
    /**
     * Defines the name of the switch.
     */
    private readonly name: string = 'Schedule';

    private switchService?: Service;
    private on?: Characteristic;

    public constructor(private controlService: MowerControlService, accessory: PlatformAccessory<AutomowerContext>, api: API) {
        super(accessory, api);
    }    

    public getUnderlyingService(): Service | undefined {
        return this.switchService;
    }

    public init(): void {
        this.switchService = this.accessory.getServiceById(this.Service.Switch, this.name);
        if (this.switchService === undefined) {
            this.switchService = new this.Service.Switch(`${this.accessory.displayName} ${this.name}`, this.name);
            this.accessory.addService(this.switchService);
        }

        this.on = this.switchService.getCharacteristic(this.Characteristic.On);
    }
}