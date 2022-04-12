import { API, Logging, PlatformAccessory } from 'homebridge';
import { AutomowerContext } from '../../automowerAccessory';
import { AutomowerPlatform } from '../../automowerPlatform';
import { GetMowersService, Mower } from '../automower/getMowersService';
import { DiscoveryService } from '../discoveryService';

/**
 * Describes model information.
 */
interface ModelInformation {
    /**
     * The manufacturer.
     */
    manufacturer: string;

    /**
     * The model name.
     */
    model: string;
}

/**
 * A {@link DiscoveryService} which uses the Automower Connect cloud service to discover mowers associated with the account.
 */
export class DiscoveryServiceImpl implements DiscoveryService {
    constructor(private mowerService: GetMowersService, private api: API, private log: Logging) { }

    async discoverMowers(platform: AutomowerPlatform): Promise<void> {
        this.log.info('Discovering new mowers...');

        const found: PlatformAccessory<AutomowerContext>[] = [];
        const mowers = await this.mowerService.getMowers();
        
        mowers?.forEach(mower => {
            const uuid = this.api.hap.uuid.generate(mower.id);
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