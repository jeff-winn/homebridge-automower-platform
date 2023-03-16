import { AutomowerPlatform } from '../../automowerPlatform';
import { PlatformLogger } from '../../diagnostics/platformLogger';
import { Mower } from '../../model';
import { MowerAccessory } from '../../mowerAccessory';
import { MowerAccessoryFactory } from '../../mowerAccessoryFactory';

/**
 * A service used to retrieve the mowers associated with a Husqvarna account.
 */
export interface GetMowersService {
    /**
     * Gets the mowers.
     */
    getMowers(): Promise<Mower[]>;
}

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
    public constructor(private mowerService: GetMowersService, private factory: MowerAccessoryFactory, private log: PlatformLogger) { }

    public async discoverMowers(platform: AutomowerPlatform): Promise<void> {
        this.log.info('DISCOVERING_NEW_MOWERS');

        const found: MowerAccessory[] = [];
        const mowers = await this.mowerService.getMowers();
        
        for (const mower of mowers) {
            let accessory = platform.getMower(mower.id);
            if (accessory === undefined) {
                // The mower was not already present, create a new accessory instance.
                accessory = this.factory.createAccessory(mower);
                found.push(accessory);
            }

            accessory.refresh(mower);
        }

        if (found.length > 0) {
            platform.registerMowers(found);
        }

        this.log.info('COMPLETED_MOWER_DISCOVERY', found.length);
    }
}