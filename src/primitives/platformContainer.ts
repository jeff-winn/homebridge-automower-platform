import { API, Logging } from 'homebridge';
import { container, InjectionToken } from 'tsyringe';

import { AuthenticationClientImpl } from '../clients/authenticationClient';
import { AutomowerClientImpl } from '../clients/automowerClient';
import { AutomowerEventStreamClientImpl } from '../clients/automowerEventStreamClient';
import { AccessTokenManagerImpl } from '../services/authentication/accessTokenManager';
import { GetMowersServiceImpl } from '../services/automower/getMowersService';
import { DiscoveryServiceImpl } from '../services/discoveryService';
import { EventStreamServiceImpl } from '../services/automower/eventStreamService';
import { AutomowerPlatformConfig } from '../automowerPlatform';
import * as constants from '../constants';
import { PlatformAccessoryFactoryImpl } from './platformAccessoryFactory';
import { TimerImpl } from './timer';
import { AccessoryFactoryImpl } from '../services/accessoryFactory';
import { MowerControlServiceImpl } from '../services/automower/mowerControlService';

export interface PlatformContainer {
    registerEverything(): void;
    
    resolve<T>(token: InjectionToken<T>): T;
}

export class PlatformContainerImpl implements PlatformContainer {
    public constructor(private log: Logging, private config: AutomowerPlatformConfig, private api: API) { }

    public registerEverything(): void {
        this.log.debug('Registering classes to the DI container...');

        container.registerInstance(AccessTokenManagerImpl, new AccessTokenManagerImpl(
            new AuthenticationClientImpl(this.config.appKey, constants.AUTHENTICATION_API_BASE_URL),
            this.config,
            this.log));

        container.register(TimerImpl, {
            useFactory: () => new TimerImpl()
        });

        container.register(AutomowerClientImpl, {
            useValue: new AutomowerClientImpl(
                this.config.appKey,
                constants.AUTOMOWER_CONNECT_API_BASE_URL)
        });

        container.register(GetMowersServiceImpl, {
            useFactory: (context) => new GetMowersServiceImpl(
                context.resolve(AccessTokenManagerImpl),
                context.resolve(AutomowerClientImpl),
                this.log)
        });

        container.register(MowerControlServiceImpl, {
            useFactory: (context) => new MowerControlServiceImpl(
                context.resolve(AccessTokenManagerImpl),
                context.resolve(AutomowerClientImpl)) 
        });

        container.register(PlatformAccessoryFactoryImpl, {
            useFactory: () => new PlatformAccessoryFactoryImpl(this.api)
        });

        container.register(AccessoryFactoryImpl, {
            useFactory: (context) => new AccessoryFactoryImpl(
                context.resolve(PlatformAccessoryFactoryImpl),
                this.api,
                this)
        });

        container.register(DiscoveryServiceImpl, {
            useFactory: (context) => new DiscoveryServiceImpl(
                context.resolve(GetMowersServiceImpl), 
                context.resolve(AccessoryFactoryImpl),               
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