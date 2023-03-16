import { InjectionToken } from 'tsyringe';
import { AutomowerPlatformConfig } from '../automowerPlatform';
import { DeviceType } from '../model';
import { MowerAccessoryFactoryImpl } from '../mowerAccessoryFactory';
import { PlatformContainer } from '../primitives/platformContainer';
import { AutomowerGetMowersService } from '../services/husqvarna/automower/automowerGetMowersService';
import { DiscoveryService, DiscoveryServiceImpl, GetMowersService } from '../services/husqvarna/discoveryService';
import { GardenaGetMowersService } from '../services/husqvarna/gardena/gardenaGetMowersService';

/**
 * A mechanism for creating a {@link DiscoveryService} instance.
 */
export interface DiscoveryServiceFactory {
    /**
     * Creates the {@link DiscoveryService} instance.
     * @param container The container used to resolve resources.
     */
    create(container: PlatformContainer): DiscoveryService;
}

export class DiscoveryServiceFactoryImpl implements DiscoveryServiceFactory {
    public constructor(private config: AutomowerPlatformConfig) { }

    public create(container: PlatformContainer): DiscoveryService {
        const mowerServiceClass = this.getMowerServiceClass();

        return new DiscoveryServiceImpl(
            container.resolve(mowerServiceClass), 
            container.resolve(MowerAccessoryFactoryImpl),               
            container.resolve(container.getLoggerClass()));
    }

    protected getMowerServiceClass(): InjectionToken<GetMowersService> {
        if (this.config.device_type === DeviceType.AUTOMOWER) {
            return AutomowerGetMowersService;
        } else if (this.config.device_type === DeviceType.GARDENA) {
            return GardenaGetMowersService;
        }

        return AutomowerGetMowersService;
    }
}