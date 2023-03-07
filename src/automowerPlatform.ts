import {
    API, APIEvent, BridgeConfiguration, DynamicPlatformPlugin, Logging, PlatformAccessory,
    PlatformConfig, PlatformIdentifier, PlatformName
} from 'homebridge';

import { MowerAccessory, MowerContext } from './automowerAccessory';
import { AutomowerAccessoryFactory, AutomowerAccessoryFactoryImpl } from './automowerAccessoryFactory';
import { SettingsEvent, StatusEvent } from './clients/automower/automowerEventStreamClient';
import { LoggerType } from './diagnostics/platformLogger';
import { BadConfigurationError } from './errors/badConfigurationError';
import { DiscoveryServiceFactoryImpl } from './factories/discoveryServiceFactory';
import { EventStreamServiceFactoryImpl } from './factories/eventStreamServiceFactory';
import { AuthenticationMode, DeviceType } from './model';
import { Localization, Y18nLocalization } from './primitives/localization';
import { PlatformContainer, PlatformContainerImpl } from './primitives/platformContainer';
import { AccessTokenManager, AccessTokenManagerImpl } from './services/husqvarna/accessTokenManager';
import { DiscoveryService } from './services/husqvarna/discoveryService';
import { EventStreamService } from './services/husqvarna/eventStreamService';
import { PLATFORM_NAME, PLUGIN_ID } from './settings';

/** 
 * Describes the platform configuration settings.
 */
export class AutomowerPlatformConfig {
    public name?: string;
    public platform: PlatformName | PlatformIdentifier;
    public _bridge?: BridgeConfiguration;

    public username?: string;
    public password?: string;
    public authentication_mode?: AuthenticationMode;
    public appKey?: string;
    public application_secret?: string;
    public lang?: string;
    public device_type?: DeviceType;
    public logger_type?: LoggerType;
    
    public constructor(config: PlatformConfig) {
        this.name = config.name;
        this.platform = config.platform;
        this._bridge = config._bridge;
        this.username = config.username;
        this.password = config.password;
        this.authentication_mode = config.authentication_mode;
        this.appKey = config.appKey;
        this.application_secret = config.application_secret;
        this.lang = config.lang;
        this.device_type = config.device_type;
        this.logger_type = config.logger_type;
    }

    /**
     * Gets the configured device type, or the default value.
     * @returns The device type.
     */
    public getDeviceTypeOrDefault(): DeviceType {
        return this.device_type ?? DeviceType.AUTOMOWER;
    }

    /**
     * Gets the configured authentication mode, or the default value.
     * @returns The authentication mode.
     */
    public getAuthenticationModeOrDefault(): AuthenticationMode {
        return this.authentication_mode ?? AuthenticationMode.PASSWORD;
    }
}

/**
 * A homebridge platform plugin which integrates with the Husqvarna Connect cloud services.
 */
export class AutomowerPlatform implements DynamicPlatformPlugin {
    private readonly mowers: MowerAccessory[] = [];
    private readonly config: AutomowerPlatformConfig;

    private container?: PlatformContainer;
    private eventService?: EventStreamService;

    public constructor(private log: Logging, config: PlatformConfig, private api: API) {
        this.config = new AutomowerPlatformConfig(config);

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
                this.error(e.message);
            } else {
                this.error('ERROR_STARTING_PLUGIN', e);
            }
        }
    }
    
    protected ensureContainerIsInitialized(): void {
        if (this.container !== undefined) {
            return;
        }        

        this.container = this.createContainer();
        this.container.registerEverything();
    }

    protected createContainer(): PlatformContainer {
        return new PlatformContainerImpl(this.config, this.api, this.log);
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

        const factory = this.container!.resolve(EventStreamServiceFactoryImpl);
        this.eventService = factory.create(this.container!);
        
        return this.eventService;
    }

    private onStatusEventReceived(event: StatusEvent): Promise<void> {
        const mower = this.getMower(event.id);
        if (mower !== undefined) {
            mower.onStatusEventReceived(event);
        }

        return Promise.resolve(undefined);
    }

    private onSettingsEventReceived(event: SettingsEvent): Promise<void> {
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
        const factory = this.container!.resolve(DiscoveryServiceFactoryImpl);
        return factory.create(this.container!);
    }

    /**
     * Gets a mower which has already been registered.
     * @param mowerId The mower id.
     * @returns The accessory instance.
     */
    public getMower(mowerId: string): MowerAccessory | undefined {
        return this.mowers.find(o => o.getId() === mowerId);
    }

    protected async onShutdown(): Promise<void> {
        try {
            await this.getEventService()?.stop();
            await this.getTokenManager()?.logout();
        } catch (e) {
            this.error('ERROR_SHUTTING_DOWN_PLUGIN', e);
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
    public registerMowers(mowers: MowerAccessory[]): void {
        const accessories: PlatformAccessory<MowerContext>[] = [];

        for (const mower of mowers) {
            this.mowers.push(mower);
            accessories.push(mower.getUnderlyingAccessory());
        }

        this.api.registerPlatformAccessories(PLUGIN_ID, PLATFORM_NAME, accessories);
    }

    /*
     * This function is invoked when homebridge restores cached accessories from disk at startup.
     * It should be used to setup event handlers for characteristics and update respective values.
     */
    public configureAccessory(accessory: PlatformAccessory<MowerContext>): void {
        try {
            this.ensureContainerIsInitialized();
            this.info('CONFIGURING_CACHED_ACCESSORY', accessory.displayName);

            const mower = this.getAccessoryFactory().createAccessoryFromCache(accessory);
            this.mowers.push(mower);
        } catch (e) {
            this.error('ERROR_CONFIGURING_ACCESSORY', e);
        }
    }

    private getAccessoryFactory(): AutomowerAccessoryFactory {
        return this.container!.resolve(AutomowerAccessoryFactoryImpl);
    }

    private getLocalization(): Localization | undefined {
        if (this.container === undefined) {
            return undefined;
        }

        return this.container.resolve(Y18nLocalization);
    }

    private info(message: string, ...params: unknown[]): void {
        const locale = this.getLocalization();
        if (locale !== undefined) {
            this.log.info(locale.format(message, ...params));
        } else {
            this.log.info(message, ...params);
        }        
    }

    private error(message: string, ...params: unknown[]): void {
        const locale = this.getLocalization();
        if (locale !== undefined) {
            this.log.error(locale.format(message, ...params));
        } else {
            this.log.error(message, ...params);
        } 
    }
}