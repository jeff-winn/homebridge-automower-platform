import { CommonServiceDataItem, DataItem, GardenaClient, ItemType, MowerServiceDataItem, RFLinkState } from '../../../clients/gardena/gardenaClient';
import { GardenaEventStreamClient } from '../../../clients/gardena/gardenaEventStreamClient';
import { PlatformLogger } from '../../../diagnostics/platformLogger';
import { InvalidStateError } from '../../../errors/invalidStateError';
import { MowerSettingsChangedEvent, MowerStatusChangedEvent } from '../../../events';
import { GardenaEventStreamServiceFactory } from '../../../factories/gardenaEventStreamServiceFactory';
import { Timer } from '../../../primitives/timer';
import { AccessTokenManager } from '../accessTokenManager';
import { AbstractEventStreamService, EventStreamService } from '../eventStreamService';
import { GardenaMowerStateConverter } from './converters/gardenaMowerStateConverter';

/**
 * A service which streams events for a specific Gardena location.
 */
export class GardenaLocationEventStreamService extends AbstractEventStreamService<GardenaEventStreamClient> {
    public constructor(private readonly mowerStateConverter: GardenaMowerStateConverter, tokenManager: AccessTokenManager, 
        stream: GardenaEventStreamClient, log: PlatformLogger, timer: Timer) {
        super(tokenManager, stream, log, timer);
    }

    protected override attachTo(stream: GardenaEventStreamClient): void {
        stream.setOnEventCallback(this.onEventReceived.bind(this));

        super.attachTo(stream);
    }

    protected onEventReceived(event: DataItem): Promise<void> {
        this.setLastEventReceived(new Date());

        switch (event.type) {
            case ItemType.MOWER:
                return this.onMowerEvent(event as MowerServiceDataItem);

            case ItemType.COMMON:
                return this.onCommonEvent(event as CommonServiceDataItem);

            default:
                this.log.warn('RECEIVED_UNKNOWN_EVENT', event.type);
                return Promise.resolve(undefined);
        }
    }

    protected async onMowerEvent(event: MowerServiceDataItem): Promise<void> {
        await this.raiseMowerStatusChangedEvent({
            mowerId: event.id,
            attributes: {
                mower: this.mowerStateConverter.convert(event),                
            }
        });
    }

    protected async onCommonEvent(event: CommonServiceDataItem): Promise<void> {
        await this.raiseMowerStatusChangedEvent({
            mowerId: event.id,
            attributes: {
                battery: {
                    level: event.attributes.batteryLevel.value
                },
                connection: {
                    connected: event.attributes.rfLinkState.value === RFLinkState.ONLINE
                }
            }
        });
    }
}

/**
 * A composite {@link EventStreamService} which can stream events for multiple locations in use for an account.
 */
export class CompositeGardenaEventStreamService implements EventStreamService {
    private readonly services: Map<string, EventStreamService> = new Map<string, EventStreamService>();

    private onStatusEventCallback?: (event: MowerStatusChangedEvent) => Promise<void>;
    private onSettingsEventCallback?: (event: MowerSettingsChangedEvent) => Promise<void>;
    private initialized = false;

    public constructor(private readonly client: GardenaClient, private serviceFactory: GardenaEventStreamServiceFactory, private readonly tokenManager: AccessTokenManager, 
        private readonly log: PlatformLogger) { }

    public setOnSettingsEventCallback(callback: (event: MowerSettingsChangedEvent) => Promise<void>): void {
        this.onSettingsEventCallback = callback;        
    }

    public setOnStatusEventCallback(callback: (event: MowerStatusChangedEvent) => Promise<void>): void {
        this.onStatusEventCallback = callback;        
    }

    public async start(): Promise<void> {
        if (!this.hasBeenInitialized()) {
            await this.init();
            this.flagAsInitialized();
        }
        
        for (const service of this.getServices()) {
            await service.start();
        }
    }

    protected hasBeenInitialized(): boolean {
        return this.initialized;
    }

    protected flagAsInitialized(): void {
        this.initialized = true;
    }

    public getServices(): EventStreamService[] {
        return Array.from(this.services.values());
    }

    protected async init(): Promise<void> {
        if (this.onSettingsEventCallback === undefined || this.onStatusEventCallback === undefined) {
            throw new InvalidStateError('The service has not been initialized.');
        }

        const token = await this.tokenManager.getCurrentTokenAsync();

        const locations = await this.client.getLocations(token);
        if (locations === undefined) {
            this.log.warn('GARDENA_NO_LOCATIONS_FOUND');
            return;
        }

        for (const location of locations.data) {
            const service = this.serviceFactory.create(location.id);

            service.setOnSettingsEventCallback(this.onSettingsEventCallback);
            service.setOnStatusEventCallback(this.onStatusEventCallback);

            this.services.set(location.id, service);
        }
    }

    public async stop(): Promise<void> {
        if (!this.hasBeenInitialized()) {
            return;
        }

        for (const service of this.getServices()) {
            await service.stop();
        }
    }
}