import { PlatformAccessory, API, DynamicPlatformPlugin, PlatformConfig, APIEvent, Logging } from 'homebridge';

import { AutomowerAccessory, AutomowerContext } from './automowerAccessory';
import { AutomowerPlatformConfig } from './automowerPlatformConfig';
import { PlatformContainer } from './primitives/platformContainer';
import { PLATFORM_NAME, PLUGIN_ID } from './constants';
import { AccessTokenManager, AccessTokenManagerImpl } from './services/authentication/accessTokenManager';
import { EventStreamService, EventStreamServiceImpl } from './services/automower/eventStreamService';
import { DiscoveryService, DiscoveryServiceImpl } from './services/discoveryService';
import { StatusEvent } from './events';

/**
 * A homebridge platform plugin which integrates with the Husqvarna Automower Connect cloud services.
 */
export class AutomowerPlatform implements DynamicPlatformPlugin {
    private readonly mowers: AutomowerAccessory[] = [];
    private readonly config: AutomowerPlatformConfig;

    private container?: PlatformContainer;
    private eventStream?: EventStreamService;

    constructor(private log: Logging, config: PlatformConfig, private api: API) {
        this.config = config as AutomowerPlatformConfig;

        api.on(APIEvent.DID_FINISH_LAUNCHING, async () => {
            try {
                await this.onFinishedLaunching();
            } catch (e) {
                this.log.error('An unexpected error occurred while starting the plugin.', e);
            }
        });

        api.on(APIEvent.SHUTDOWN, async () => {
            try {
                await this.onShutdown();
            } catch (e) {
                this.log.error('An unexpected error occurred while starting the plugin.', e);
            }
        });
    }

    protected async onFinishedLaunching(): Promise<void> {
        this.configureContainer();

        await this.discoverNewMowers();
        await this.startReceivingEvents();

        this.log.debug('onFinishLaunching');
    }
    
    protected configureContainer(): void {
        this.container = new PlatformContainer(this.log, this.config, this.api);
        this.container.registerEverything();
    }

    protected async discoverNewMowers(): Promise<void> {
        const service = this.getDiscoveryService();
        await service.discoverMowers(this);
    }

    protected async startReceivingEvents(): Promise<void> {
        this.eventStream = this.getEventStreamService();
        this.eventStream.onStatusEventReceived(this.onStatusEventReceived.bind(this));
        
        await this.eventStream.start();
    }

    protected getEventStreamService(): EventStreamService {
        return this.container!.resolve(EventStreamServiceImpl);
    }

    private async onStatusEventReceived(event: StatusEvent): Promise<void> {
        const mower = this.mowers.find(o => o.getUuid() === event.id);
        if (mower !== undefined) {
            await mower.onStatusEventReceived(event);
        }
    }

    /**
     * Gets {@link DiscoveryService}.
     * @returns The service instance.
     */
    protected getDiscoveryService(): DiscoveryService {
        return this.container!.resolve(DiscoveryServiceImpl);
    }

    /**
     * Checks whether a mower is configured.
     * @param uuid The uuid to check.
     * @returns true if the mower is already configured, otherwise false.
     */
    public isMowerConfigured(uuid: string): boolean {
        return this.mowers.some(accessory => accessory.getUuid() === uuid);
    }

    protected async onShutdown(): Promise<void> {
        this.log.info('Shutting down...');

        await this.eventStream?.stop();
        await this.getTokenManager()?.logout();
    }

    /**
     * Gets the token manager.
     * @returns The service instance.
     */
    protected getTokenManager(): AccessTokenManager | undefined {
        if (this.container === undefined) {
            return undefined;
        }

        return this.container.resolve(AccessTokenManagerImpl);
    }

    /**
     * Registers the accessories with the platform.
     * @param accessories The accessories to register.
     */
    public registerMowers(mowers: PlatformAccessory<AutomowerContext>[]): void {
        mowers.forEach(mower => this.configureAccessory(mower));

        this.api.registerPlatformAccessories(PLUGIN_ID, PLATFORM_NAME, mowers);
    }

    /*
     * This function is invoked when homebridge restores cached accessories from disk at startup.
     * It should be used to setup event handlers for characteristics and update respective values.
     */
    public configureAccessory(accessory: PlatformAccessory<AutomowerContext>): void {
        try {
            this.log.info(`Configuring ${accessory.displayName}`);

            const automower = this.createAutomowerAccessory(accessory);
            this.mowers.push(automower);
        } catch (e) {
            this.log.error('An unexpected error occurred while configuring the accessory.', e);
        }            
    }

    protected createAutomowerAccessory(accessory: PlatformAccessory<AutomowerContext>): AutomowerAccessory {
        const automower = new AutomowerAccessory(this, accessory, this.api, this.log);
        automower.init();

        return automower;
    }
}