import { PlatformAccessory, API, DynamicPlatformPlugin, PlatformConfig, APIEvent, Logging } from 'homebridge';
import { OAuthTokenManagerImpl } from './authentication/impl/oauthTokenManagerImpl';
import { OAuthTokenManager } from './authentication/oauthTokenManager';
import { AutomowerAccessory, AutomowerContext } from './automowerAccessory';
import { AutomowerPlatformConfig } from './automowerPlatformConfig';
import { AutomowerPlatformContainer } from './automowerPlatformContainer';
import { PLATFORM_NAME, PLUGIN_ID } from './constants';
import { DiscoveryServiceImpl } from './services/impl/discoveryServiceImpl';
import { DiscoveryService } from './services/discoveryService';

export class AutomowerPlatform implements DynamicPlatformPlugin {
    private readonly accessories: AutomowerAccessory[] = [];

    private readonly config: AutomowerPlatformConfig;
    private readonly container: AutomowerPlatformContainer;        

    constructor(private log: Logging, config: PlatformConfig, private api: API) {
        this.config = config as AutomowerPlatformConfig;
        this.container = new AutomowerPlatformContainer(this.log, this.config, this.api);

        api.on(APIEvent.DID_FINISH_LAUNCHING, async () => {            
            await this.onFinishedLaunching();
        });

        api.on(APIEvent.SHUTDOWN, async () => {
            await this.onShutdown();
        });
    }

    private async onFinishedLaunching(): Promise<void> {
        this.container.registerEverything();

        await this.discoverNewMowers();

        this.log.debug('onFinishLaunching');
    }
    
    private async discoverNewMowers(): Promise<void> {
        const service = this.getDiscoveryService();
        await service.discoverMowers(this);
    }

    protected getDiscoveryService(): DiscoveryService {
        return this.container.resolve(DiscoveryServiceImpl);
    }

    /**
     * Checks whether an accessory is already registered with the uuid specified.
     * @param uuid The uuid to check.
     * @returns true if the accessory is already registered, otherwise false.
     */
    public isAlreadyRegistered(uuid: string): boolean {
        return this.accessories.some(accessory => accessory.getUuid() === uuid);
    }

    private async onShutdown(): Promise<void> {
        this.log.info('Shutting down...');

        const tokenManager = this.getOAuthTokenManager();
        await tokenManager.logout();
    }

    protected getOAuthTokenManager(): OAuthTokenManager {
        return this.container.resolve(OAuthTokenManagerImpl);
    }

    /**
     * Registers the accessories with the platform.
     * @param accessories The accessories to register.
     */
    public registerAccessories(accessories: PlatformAccessory<AutomowerContext>[]): void {
        accessories.forEach(accessory => this.configureAccessory(accessory));

        this.api.registerPlatformAccessories(PLUGIN_ID, PLATFORM_NAME, accessories);
    }

    /*
     * This function is invoked when homebridge restores cached accessories from disk at startup.
     * It should be used to setup event handlers for characteristics and update respective values.
     */
    public configureAccessory(accessory: PlatformAccessory<AutomowerContext>): void {
        this.log.info(`Configuring accessory ${accessory.displayName}`);

        this.accessories.push(new AutomowerAccessory(this, accessory, this.api, this.log));
    }
}