import { AutomowerPlatform } from '../src/automowerPlatform';
import { PlatformContainer } from '../src/primitives/platformContainer';
import { DiscoveryService } from '../src/services/husqvarna/discoveryService';
import { EventStreamService } from '../src/services/husqvarna/eventStreamService';

export class AutomowerPlatformSpy extends AutomowerPlatform {
    public containerConfigured = false;
    public platformContainer?: PlatformContainer;

    public unsafeEnsureContainerIsInitialized(): void {
        this.ensureContainerIsInitialized();
    }

    public unsafeGetEventService(): EventStreamService {
        return this.getEventService();
    }

    public unsafeGetDiscoveryService(): DiscoveryService {
        return this.getDiscoveryService();
    }

    public unsafeOnFinishedLaunchingCallback(): void {
        this.onFinishedLaunchingCallback();
    }

    public unsafeOnShutdownCallback(): void {
        this.onShutdownCallback();
    }
    
    protected override ensureContainerIsInitialized(): void {
        this.containerConfigured = true;

        super.ensureContainerIsInitialized();
    }

    protected override createContainer(): PlatformContainer {
        if (this.platformContainer !== undefined) {
            return this.platformContainer;
        }

        return super.createContainer();
    }
}