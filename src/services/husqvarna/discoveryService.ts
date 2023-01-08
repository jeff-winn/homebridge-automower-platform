import { AutomowerAccessory } from '../../automowerAccessory';
import { AutomowerAccessoryFactory } from '../../automowerAccessoryFactory';
import { AutomowerPlatform } from '../../automowerPlatform';
import { Mower } from '../../clients/automower/automowerClient';
import { PlatformLogger } from '../../diagnostics/platformLogger';

/**
 * A service used to retrieve the mowers associated with a Husqvarna account.
 */
export interface GetMowersService {
    /**
     * Gets a mower by the id.
     * @param id The id of the mower.
     */
    getMower(id: string) : Promise<Mower | undefined>;

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
    public constructor(private mowerService: GetMowersService, private factory: AutomowerAccessoryFactory, private log: PlatformLogger) { }

    public async discoverMowers(platform: AutomowerPlatform): Promise<void> {
        this.log.info('DISCOVERING_NEW_MOWERS');

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

        this.log.info('COMPLETED_MOWER_DISCOVERY', found.length);
    }
}