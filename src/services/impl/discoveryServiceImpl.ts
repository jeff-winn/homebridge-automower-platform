import { API, Logging, PlatformAccessory } from 'homebridge';
import { AutomowerContext } from '../../automowerAccessory';
import { AutomowerPlatform } from '../../automowerPlatform';
import { GetMowersService, Mower } from '../automower/getMowersService';
import { DiscoveryService } from '../discoveryService';

interface ModelInformation {
    manufacturer: string;
    model: string;
}

export class DiscoveryServiceImpl implements DiscoveryService {
    constructor(private mowerService: GetMowersService, private api: API, private log: Logging) { }

    async discoverMowers(platform: AutomowerPlatform): Promise<void> {
        this.log.info('Discovering new mowers...');

        const newAccessories: PlatformAccessory<AutomowerContext>[] = [];
        const mowers = await this.mowerService.getMowers();
        
        mowers?.forEach(mower => {
            const uuid = this.api.hap.uuid.generate(mower.id);
            if (!platform.isAccessoryAlreadyRegistered(uuid)) {
                const accessory = this.createAccessory(uuid, mower);

                newAccessories.push(accessory);
            }
        });

        if (newAccessories.length > 0) {
            platform.registerAccessories(newAccessories);
        }

        this.log.info(`Completed mower discovery, ${newAccessories.length} new mower(s) found.`);
    }

    private createAccessory(uuid: string, mower: Mower): PlatformAccessory<AutomowerContext> {
        const displayName = mower.attributes.system.name;
        const modelInformation = this.parseModelInformation(mower.attributes.system.model);
        
        const accessory = new this.api.platformAccessory<AutomowerContext>(displayName, uuid);
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