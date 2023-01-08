import { InjectionToken } from 'tsyringe';
import { AutomowerAccessoryFactoryImpl } from '../automowerAccessoryFactory';
import { AutomowerPlatformConfig } from '../automowerPlatform';
import { HomebridgeImitationLogger } from '../diagnostics/platformLogger';
import { ErrorFactory } from '../errors/errorFactory';
import { DeviceType } from '../model';
import { PlatformContainer } from '../primitives/platformContainer';
import { AutomowerGetMowersServiceImpl } from '../services/husqvarna/automower/automowerGetMowersServiceImpl';
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
    public constructor(private config: AutomowerPlatformConfig, private errorFactory: ErrorFactory) { }

    public create(container: PlatformContainer): DiscoveryService {
        let getMowerServiceClass: InjectionToken<GetMowersService>;

        if (this.config.device_type === undefined || this.config.device_type === DeviceType.AUTOMOWER) {
            getMowerServiceClass = AutomowerGetMowersServiceImpl;
        } else if (this.config.device_type === DeviceType.GARDENA) {
            getMowerServiceClass = GardenaGetMowersService;
        } else {
            throw this.errorFactory.badConfigurationError('ERROR_INVALID_DEVICE_TYPE', 'CFG0003', this.config.device_type);
        }

        return new DiscoveryServiceImpl(
            container.resolve(getMowerServiceClass), 
            container.resolve(AutomowerAccessoryFactoryImpl),               
            container.resolve(HomebridgeImitationLogger));
    }
}