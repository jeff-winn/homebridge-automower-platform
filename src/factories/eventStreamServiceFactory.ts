import { InjectionToken } from 'tsyringe';
import { AutomowerPlatformConfig } from '../automowerPlatform';
import { ErrorFactory } from '../errors/errorFactory';
import { DeviceType } from '../model';
import { PlatformContainer } from '../primitives/platformContainer';
import { AutomowerEventStreamService } from '../services/husqvarna/automower/automowerEventStreamService';
import { EventStreamService } from '../services/husqvarna/eventStreamService';
import { CompositeGardenaEventStreamService } from '../services/husqvarna/gardena/gardenaEventStreamService';

/**
 * A mechanism for creating a {@link EventStreamService} instance.
 */
export interface EventStreamServiceFactory {
    /**
     * Creates the {@link EventStreamService} instance.
     * @param container The container used to resolve resources.
     */
    create(container: PlatformContainer): EventStreamService;
}

export class EventStreamServiceFactoryImpl implements EventStreamServiceFactory {
    public constructor(private config: AutomowerPlatformConfig, private errorFactory: ErrorFactory) { }
    
    public create(container: PlatformContainer): EventStreamService {
        let eventStreamServiceClass: InjectionToken<EventStreamService>;

        if (this.config.device_type === undefined || this.config.device_type === DeviceType.AUTOMOWER) {
            eventStreamServiceClass = AutomowerEventStreamService;        
        } else if (this.config.device_type === DeviceType.GARDENA) {
            eventStreamServiceClass = CompositeGardenaEventStreamService;
        } else {
            throw this.errorFactory.badConfigurationError('ERROR_INVALID_DEVICE_TYPE', 'CFG0003', this.config.device_type);
        }

        return container.resolve(eventStreamServiceClass);
    }
}