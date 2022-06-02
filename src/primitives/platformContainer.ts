import { API } from 'homebridge';
import { container, InjectionToken } from 'tsyringe';

import { AuthenticationClientImpl } from '../clients/authenticationClient';
import { AutomowerClientImpl } from '../clients/automowerClient';
import { AutomowerEventStreamClientImpl } from '../clients/automowerEventStreamClient';
import { AccessTokenManagerImpl } from '../services/automower/accessTokenManager';
import { GetMowersServiceImpl } from '../services/automower/getMowersService';
import { DiscoveryServiceImpl } from '../services/automower/discoveryService';
import { EventStreamServiceImpl } from '../services/automower/eventStreamService';
import { AutomowerPlatformConfig } from '../automowerPlatform';
import * as constants from '../settings';
import { PlatformAccessoryFactoryImpl } from './platformAccessoryFactory';
import { TimerImpl } from './timer';
import { AutomowerAccessoryFactoryImpl } from './automowerAccessoryFactory';
import { MowerControlServiceImpl } from '../services/automower/mowerControlService';
import { PlatformLogger } from '../diagnostics/platformLogger';
import { DeterministicScheduleEnabledPolicy } from '../services/policies/scheduleEnabledPolicy';
import { DefaultFetchClient } from './fetchClient';

export interface PlatformContainer {
    registerEverything(): void;
    
    resolve<T>(token: InjectionToken<T>): T;
}

export class PlatformContainerImpl implements PlatformContainer {
    public constructor(private log: PlatformLogger, private config: AutomowerPlatformConfig, private api: API) { }

    public registerEverything(): void {
        this.log.debug('Registering classes to the DI container...');

        container.register(DefaultFetchClient, {
            useValue: new DefaultFetchClient(this.log)
        });

        container.register(TimerImpl, {
            useFactory: () => new TimerImpl()
        });

        container.register(AuthenticationClientImpl, {
            useFactory: (context) => new AuthenticationClientImpl(this.config.appKey,
                constants.AUTHENTICATION_API_BASE_URL,
                context.resolve(DefaultFetchClient))
        });

        container.registerInstance(AccessTokenManagerImpl, new AccessTokenManagerImpl(
            container.resolve(AuthenticationClientImpl),
            this.config,
            this.log));

        container.register(AutomowerClientImpl, {
            useFactory: (context) => new AutomowerClientImpl(
                this.config.appKey,
                constants.AUTOMOWER_CONNECT_API_BASE_URL,
                context.resolve(DefaultFetchClient))
        });

        container.register(DeterministicScheduleEnabledPolicy, {
            useValue: new DeterministicScheduleEnabledPolicy()
        });

        container.register(GetMowersServiceImpl, {
            useFactory: (context) => new GetMowersServiceImpl(
                context.resolve(AccessTokenManagerImpl),
                context.resolve(AutomowerClientImpl))
        });

        container.register(MowerControlServiceImpl, {
            useFactory: (context) => new MowerControlServiceImpl(
                context.resolve(AccessTokenManagerImpl),
                context.resolve(AutomowerClientImpl)) 
        });

        container.register(PlatformAccessoryFactoryImpl, {
            useFactory: () => new PlatformAccessoryFactoryImpl(this.api)
        });

        container.register(AutomowerAccessoryFactoryImpl, {
            useFactory: (context) => new AutomowerAccessoryFactoryImpl(
                context.resolve(PlatformAccessoryFactoryImpl),
                this.api,
                this.log,
                this)
        });

        container.register(DiscoveryServiceImpl, {
            useFactory: (context) => new DiscoveryServiceImpl(
                context.resolve(GetMowersServiceImpl), 
                context.resolve(AutomowerAccessoryFactoryImpl),               
                this.log)
        });

        container.register(AutomowerEventStreamClientImpl, {
            useFactory: () => new AutomowerEventStreamClientImpl(
                constants.AUTOMOWER_STREAM_API_BASE_URL, 
                this.log)
        });

        container.register(EventStreamServiceImpl, {
            useFactory: (context) => new EventStreamServiceImpl(
                context.resolve(AccessTokenManagerImpl),
                context.resolve(AutomowerEventStreamClientImpl),
                this.log,
                context.resolve(TimerImpl))
        });
        
        this.log.debug('Completed DI container registrations.');
    }

    public resolve<T>(token: InjectionToken<T>): T {
        return container.resolve(token);
    }
}