import { Logging, PlatformAccessory } from 'homebridge';
import { AutomowerContext } from '../../automowerAccessory';
import { AutomowerPlatform } from '../../automowerPlatform';
import { AccessoryFactory } from '../../accessoryFactory';
import { GetMowersService, Mower } from '../automower/getMowersService';
import { DiscoveryService } from '../discoveryService';

interface ModelInformation {
    manufacturer: string;
    model: string;
}

/**
 * A {@link DiscoveryService} which uses the Automower Connect cloud service to discover mowers associated with the account.
 */
export class DiscoveryServiceImpl implements DiscoveryService {
    constructor(private mowerService: GetMowersService, private log: Logging, private accessoryFactory: AccessoryFactory) { }

    async discoverMowers(platform: AutomowerPlatform): Promise<void> {
        this.log.info('Discovering new mowers...');

        const found: PlatformAccessory<AutomowerContext>[] = [];
        const mowers = await this.mowerService.getMowers();
        
        mowers?.forEach(mower => {
            const uuid = this.accessoryFactory.generateUuid(mower.id);
            if (!platform.isMowerConfigured(uuid)) {
                const accessory = this.createAccessory(uuid, mower);
                found.push(accessory);
            }
        });

        if (found.length > 0) {
            platform.registerMowers(found);
        }

        this.log.info(`Completed mower discovery, ${found.length} new mower(s) found.`);
    }

    private createAccessory(uuid: string, mower: Mower): PlatformAccessory<AutomowerContext> {
        const displayName = mower.attributes.system.name;
        const modelInformation = this.parseModelInformation(mower.attributes.system.model);
        
        const accessory = this.accessoryFactory.create(displayName, uuid);

        accessory.context = {
            mowerId: mower.id,
            manufacturer: modelInformation.manufacturer,
            model: modelInformation.model,
            serialNumber: mower.attributes.system.serialNumber.toString()
        };
        
        return accessory;
    }

    private parseModelInformation(value: string): ModelInformation {
        const firstIndex = value.indexOf(' ');

        return {
            manufacturer: value.substring(0, firstIndex),
            model: value.substring(firstIndex + 1)
        };
    }
}