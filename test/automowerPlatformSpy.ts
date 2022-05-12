import { AutomowerPlatform } from '../src/automowerPlatform';
import { AccessTokenManager } from '../src/services/authentication/accessTokenManager';
import { EventStreamService } from '../src/services/automower/eventStreamService';
import { DiscoveryService } from '../src/services/discoveryService';

export class AutomowerPlatformSpy extends AutomowerPlatform {
    public discoveryService?: DiscoveryService;
    public eventStreamService?: EventStreamService;
    public tokenManager?: AccessTokenManager;
    public containerConfigured = false;

    public unsafeOnFinishedLaunching(): Promise<void> {
        return this.onFinishedLaunching();
    }

    public unsafeOnShutdown(): Promise<void> {
        return this.onShutdown();
    }
    
    protected override ensureContainerIsInitialized(): void {
        this.containerConfigured = true;
    }

    protected override getDiscoveryService(): DiscoveryService {
        return this.discoveryService!;
    }

    protected override getEventService(): EventStreamService {
        return this.eventStreamService!;
    }

    protected override getTokenManager(): AccessTokenManager {
        return this.tokenManager!;
    }
}