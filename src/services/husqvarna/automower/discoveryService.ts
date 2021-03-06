import { AutomowerAccessory } from '../../../automowerAccessory';
import { AutomowerPlatform } from '../../../automowerPlatform';
import { PlatformLogger } from '../../../diagnostics/platformLogger';
import { AutomowerAccessoryFactory } from '../../../primitives/automowerAccessoryFactory';
import { GetMowersService } from './getMowersService';

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
    public constructor(private mowerService: GetMowersService, private factory: AutomowerAccessoryFactory, private log: PlatformLogger) { }

    public async discoverMowers(platform: AutomowerPlatform): Promise<void> {
        this.log.info('Discovering new mowers...');

        const found: AutomowerAccessory[] = [];
        const mowers = await this.mowerService.getMowers();
        
        mowers.forEach(mower => {
            let accessory = platform.getMower(mower.id);
            if (accessory === undefined) {
                // The mower was not already present, create a new accessory instance.
                accessory = this.factory.createAccessory(mower);
                found.push(accessory);
            }

            accessory.refresh(mower);
        });

        if (found.length > 0) {
            platform.registerMowers(found);
        }

        this.log.info('Completed mower discovery, %d new mower(s) found.', found.length);
    }
}