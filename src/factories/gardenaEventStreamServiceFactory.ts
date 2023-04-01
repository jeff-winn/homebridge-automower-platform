import { GardenaEventStreamClient, GardenaEventStreamClientImpl } from '../clients/gardena/gardenaEventStreamClient';
import { PlatformLogger } from '../diagnostics/platformLogger';
import { PlatformContainer } from '../primitives/platformContainer';
import { TimerImpl } from '../primitives/timer';
import { AccessTokenManagerImpl } from '../services/husqvarna/accessTokenManager';
import { EventStreamService } from '../services/husqvarna/eventStreamService';
import { GardenaLocationEventStreamService } from '../services/husqvarna/gardena/gardenaEventStreamService';

/**
 * A factory for Gardena {@link EventStreamService} instances.
 */
export interface GardenaEventStreamServiceFactory {
    /**
     * Creates the service.
     * @param locationId The location id.
     */
    create(locationId: string): EventStreamService;
}

/**
 * A {@link GardenaEventStreamServiceFactory} capable of creating {@link EventStreamService} instances to monitor Gardena locations.
 */
export class GardenaEventStreamServiceFactoryImpl implements GardenaEventStreamServiceFactory {
    public constructor(private readonly container: PlatformContainer, private readonly log: PlatformLogger) { }

    public create(locationId: string): EventStreamService {
        const stream = this.createStreamClient(locationId);

        const tokenManager = this.container.resolve(AccessTokenManagerImpl);
        const timer = this.container.resolve(TimerImpl);
        
        return new GardenaLocationEventStreamService(
            tokenManager,
            stream,
            this.log,
            timer);
    }

    protected createStreamClient(locationId: string): GardenaEventStreamClient {
        const client = this.container.resolve(this.container.getGardenaClientClass());

        return new GardenaEventStreamClientImpl(
            locationId, client, this.log);
    }
}