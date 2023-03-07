import { AutomowerPlatform } from '../src/automowerPlatform';
import { PlatformContainer } from '../src/primitives/platformContainer';

export class AutomowerPlatformSpy extends AutomowerPlatform {
    public containerConfigured = false;
    public platformContainer?: PlatformContainer;

    public unsafeOnFinishedLaunching(): Promise<void> {
        return this.onFinishedLaunching();
    }

    public unsafeOnShutdown(): Promise<void> {
        return this.onShutdown();
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