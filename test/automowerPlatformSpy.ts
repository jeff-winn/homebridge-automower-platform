import { AutomowerPlatform } from '../src/automowerPlatform';
import { AccessTokenManager } from '../src/services/authentication/accessTokenManager';
import { EventStreamService } from '../src/services/automower/eventStreamService';
import { DiscoveryService } from '../src/services/discoveryService';

export class AutomowerPlatformSpy extends AutomowerPlatform {
    discoveryService?: DiscoveryService;
    eventStreamService?: EventStreamService;
    tokenManager?: AccessTokenManager;

    containerConfigured = false;

    unsafeOnFinishedLaunching(): Promise<void> {
        return this.onFinishedLaunching();
    }

    unsafeOnShutdown(): Promise<void> {
        return this.onShutdown();
    }
    
    protected configureContainer(): void {
        this.containerConfigured = true;
    }

    protected getDiscoveryService(): DiscoveryService {
        return this.discoveryService!;
    }

    protected getEventService(): EventStreamService {
        return this.eventStreamService!;
    }

    protected getTokenManager(): AccessTokenManager {
        return this.tokenManager!;
    }
}