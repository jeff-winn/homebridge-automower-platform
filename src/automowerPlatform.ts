import { 
    PlatformAccessory, API, DynamicPlatformPlugin, 
    PlatformConfig, APIEvent, Logging
} from 'homebridge';

import { AutomowerAccessory, AutomowerContext } from './automowerAccessory';
import { PlatformContainer, PlatformContainerImpl } from './primitives/platformContainer';
import { PLATFORM_NAME, PLUGIN_ID } from './settings';
import { SettingsEvent, StatusEvent } from './events';
import { AccessTokenManager, AccessTokenManagerImpl } from './services/automower/accessTokenManager';
import { EventStreamService, EventStreamServiceImpl } from './services/automower/eventStreamService';
import { DiscoveryService, DiscoveryServiceImpl } from './services/automower/discoveryService';
import { AutomowerAccessoryFactory, AutomowerAccessoryFactoryImpl } from './primitives/automowerAccessoryFactory';
import { BadConfigurationError } from './errors/badConfigurationError';

/** 
 * Describes the platform configuration settings.
 */
export interface AutomowerPlatformConfig extends PlatformConfig {    
    username: string | undefined;
    password: string | undefined;
    appKey: string | undefined;
}

/**
 * A homebridge platform plugin which integrates with the Husqvarna Automower Connect cloud services.
 */
export class AutomowerPlatform implements DynamicPlatformPlugin {
    private readonly mowers: AutomowerAccessory[] = [];
    private readonly config: AutomowerPlatformConfig;

    private container?: PlatformContainer;
    private eventService?: EventStreamService;

    public constructor(private log: Logging, config: PlatformConfig, private api: API) {
        this.config = config as AutomowerPlatformConfig;

        api.on(APIEvent.DID_FINISH_LAUNCHING, this.onFinishedLaunching.bind(this));
        api.on(APIEvent.SHUTDOWN, this.onShutdown.bind(this));
    }

    protected async onFinishedLaunching(): Promise<void> {
        try {
            this.ensureContainerIsInitialized();

            await this.discoverMowers();
            await this.startReceivingEvents();
        } catch (e) {
            if (e instanceof BadConfigurationError) {
                // The message should be in a format that is readable to an end user, just display that instead.
                this.log.error(e.message);
            } else {
                this.log.error('An unexpected error occurred while starting the plugin.', e);
            }
        }
    }
    
    protected ensureContainerIsInitialized(): void {
        if (this.container !== undefined) {
            return;
        }        

        this.container = new PlatformContainerImpl(this.config, this.api);
        this.container.registerEverything();
    }

    protected async discoverMowers(): Promise<void> {
        const service = this.getDiscoveryService();
        await service.discoverMowers(this);
    }

    protected async startReceivingEvents(): Promise<void> {
        const service = this.getEventService();
        
        service.onStatusEventReceived(this.onStatusEventReceived.bind(this));
        service.onSettingsEventReceived(this.onSettingsEventReceived.bind(this));
        
        await service.start();
    }

    protected getEventService(): EventStreamService {
        if (this.eventService !== undefined) {
            return this.eventService;
        }

        this.eventService = this.container!.resolve(EventStreamServiceImpl);
        return this.eventService;
    }

    private async onStatusEventReceived(event: StatusEvent): Promise<void> {
        const mower = this.mowers.find(o => o.getId() === event.id);
        if (mower !== undefined) {
            mower.onStatusEventReceived(event);
        }

        return Promise.resolve(undefined);
    }

    private async onSettingsEventReceived(event: SettingsEvent): Promise<void> {
        const mower = this.getMower(event.id);
        if (mower !== undefined) {
            mower.onSettingsEventReceived(event);
        }

        return Promise.resolve(undefined);
    }

    /**
     * Gets {@link DiscoveryService}.
     * @returns The service instance.
     */
    protected getDiscoveryService(): DiscoveryService {
        return this.container!.resolve(DiscoveryServiceImpl);
    }

    /**
     * Gets a mower which has already been registered.
     * @param mowerId The mower id.
     * @returns The accessory instance.
     */
    public getMower(mowerId: string): AutomowerAccessory | undefined {
        return this.mowers.find(o => o.getId() === mowerId);
    }

    protected async onShutdown(): Promise<void> {
        try {
            await this.getEventService()?.stop();
            await this.getTokenManager()?.logout();
        } catch (e) {
            this.log.error('An unexpected error occurred while shutting down the plugin.', e);
        }
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
    public registerMowers(mowers: AutomowerAccessory[]): void {
        const accessories: PlatformAccessory<AutomowerContext>[] = [];

        mowers.forEach(mower => {
            this.mowers.push(mower);
            accessories.push(mower.getUnderlyingAccessory());
        });

        this.api.registerPlatformAccessories(PLUGIN_ID, PLATFORM_NAME, accessories);
    }

    /*
     * This function is invoked when homebridge restores cached accessories from disk at startup.
     * It should be used to setup event handlers for characteristics and update respective values.
     */
    public configureAccessory(accessory: PlatformAccessory<AutomowerContext>): void {
        try {
            this.ensureContainerIsInitialized();
            this.log.info(`Configuring '${accessory.displayName}' from the accessory cache.`);

            const automower = this.getAccessoryFactory().createAutomowerAccessory(accessory);
            this.mowers.push(automower);
        } catch (e) {
            this.log.error('An unexpected error occurred while configuring the accessory.', e);
        }
    }

    protected getAccessoryFactory(): AutomowerAccessoryFactory {
        return this.container!.resolve(AutomowerAccessoryFactoryImpl);
    }
}
