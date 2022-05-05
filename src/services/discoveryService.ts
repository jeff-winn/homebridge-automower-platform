import { Logging } from 'homebridge';

import { AutomowerAccessory } from '../automowerAccessory';
import { AutomowerPlatform } from '../automowerPlatform';
import { GetMowersService } from './automower/getMowersService';
import { AccessoryService } from './accessoryService';

/**
 * A mechanism to discover any automowers associated with an account.
 */
export interface DiscoveryService {
    /**
     * Discovers any new mowers that should register.
     * @param platform The platform to which the accessories should be registered.
     */
    discoverMowers(platform: AutomowerPlatform): Promise<void>;
}

/**
 * A {@link DiscoveryService} which uses the Automower Connect cloud service to discover mowers associated with the account.
 */
export class DiscoveryServiceImpl implements DiscoveryService {
    constructor(private mowerService: GetMowersService, private accessoryService: AccessoryService, private log: Logging) { }

    async discoverMowers(platform: AutomowerPlatform): Promise<void> {
        this.log.info('Discovering new mowers...');

        const found: AutomowerAccessory[] = [];
        const mowers = await this.mowerService.getMowers();
        
        mowers.forEach(mower => {
            if (platform.isMowerConfigured(mower.id)) {
                // The mower was reloaded from cache, it will need to be re-initialized with the mower data.
                platform.updateMower(mower);
            } else {
                const accessory = this.accessoryService.createAccessory(mower);
                found.push(accessory);
            }
        });

        if (found.length > 0) {
            platform.registerMowers(found);
        }

        this.log.info(`Completed mower discovery, ${found.length} new mower(s) found.`);
    }
}