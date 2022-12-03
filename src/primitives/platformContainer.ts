import { API } from 'homebridge';
import { container, InjectionToken } from 'tsyringe';

import * as settings from '../settings';

import { AutomowerAccessoryFactoryImpl } from '../automowerAccessoryFactory';
import { AutomowerPlatformConfig } from '../automowerPlatform';
import { AuthenticationClientImpl } from '../clients/authenticationClient';
import { AutomowerClientImpl } from '../clients/automowerClient';
import { AutomowerEventStreamClientImpl } from '../clients/automowerEventStreamClient';
import { RetryerFetchClient } from '../clients/fetchClient';
import { ShouldLogHeaderPolicyImpl } from '../clients/policies/shouldLogHeaderPolicyImpl';
import { RateLimitedAutomowerClient } from '../clients/rateLimitedAutomowerClient';
import { HomebridgeImitationLogger } from '../diagnostics/platformLogger';
import { ConsoleWrapperImpl } from '../diagnostics/primitives/consoleWrapper';
import { DefaultErrorFactory } from '../errors/errorFactory';
import { AccessTokenManagerImpl, OAuth2AuthorizationStrategy } from '../services/husqvarna/accessTokenManager';
import { ClientCredentialsAuthorizationStrategy } from '../services/husqvarna/authorization/ClientCredentialsAuthorizationStrategy';
import { LegacyPasswordAuthorizationStrategy } from '../services/husqvarna/authorization/LegacyPasswordAuthorizationStrategy';
import { DiscoveryServiceImpl } from '../services/husqvarna/automower/discoveryService';
import { EventStreamServiceImpl } from '../services/husqvarna/automower/eventStreamService';
import { GetMowersServiceImpl } from '../services/husqvarna/automower/getMowersService';
import { MowerControlServiceImpl } from '../services/husqvarna/automower/mowerControlService';
import { DeterministicMowerFaultedPolicy } from '../services/policies/mowerFaultedPolicy';
import { DeterministicMowerInMotionPolicy } from '../services/policies/mowerInMotionPolicy';
import { DeterministicMowerIsArrivingPolicy } from '../services/policies/mowerIsArrivingPolicy';
import { DeterministicMowerIsPausedPolicy } from '../services/policies/mowerIsPausedPolicy';
import { DeterministicMowerTamperedPolicy } from '../services/policies/mowerTamperedPolicy';
import { DeterministicScheduleEnabledPolicy } from '../services/policies/scheduleEnabledPolicy';
import { NodeJsEnvironment } from './environment';
import { Y18nLocalization } from './localization';
import { PlatformAccessoryFactoryImpl } from './platformAccessoryFactory';
import { TimerImpl } from './timer';

export interface PlatformContainer {
    registerEverything(): void;
    
    resolve<T>(token: InjectionToken<T>): T;
}

export class PlatformContainerImpl implements PlatformContainer {
    public constructor(private config: AutomowerPlatformConfig, private api: API) { }

    public registerEverything(): void {
        container.register(NodeJsEnvironment, {
            useValue: new NodeJsEnvironment()
        });

        container.register(ConsoleWrapperImpl, {
            useValue: new ConsoleWrapperImpl() 
        });

        container.register(Y18nLocalization, {
            useValue: new Y18nLocalization(this.config.lang)
        });

        container.register(HomebridgeImitationLogger, {
            useFactory: (context) => new HomebridgeImitationLogger(
                context.resolve(NodeJsEnvironment),
                settings.PLATFORM_NAME, 
                this.config.name,                
                context.resolve(ConsoleWrapperImpl),
                context.resolve(Y18nLocalization))
        });

        container.register(ShouldLogHeaderPolicyImpl, {
            useValue: new ShouldLogHeaderPolicyImpl()
        });

        container.register(RetryerFetchClient, {
            useFactory: (context) => new RetryerFetchClient(
                context.resolve(HomebridgeImitationLogger), 
                context.resolve(ShouldLogHeaderPolicyImpl))
        });

        container.register(TimerImpl, {
            useFactory: () => new TimerImpl()
        });

        container.register(DefaultErrorFactory, {
            useFactory: (context) => new DefaultErrorFactory(
                context.resolve(Y18nLocalization))
        });
        
        container.register(AuthenticationClientImpl, {
            useFactory: (context) => new AuthenticationClientImpl(
                settings.AUTHENTICATION_API_BASE_URL,
                context.resolve(RetryerFetchClient),
                context.resolve(DefaultErrorFactory))
        });

        container.register(LegacyPasswordAuthorizationStrategy, {
            useFactory: (context) => new LegacyPasswordAuthorizationStrategy(
                context.resolve(DefaultErrorFactory),
                context.resolve(HomebridgeImitationLogger))
        });

        container.register(ClientCredentialsAuthorizationStrategy, {
            useFactory: (context) => new ClientCredentialsAuthorizationStrategy(
                context.resolve(DefaultErrorFactory))
        });
        
        container.registerInstance(AccessTokenManagerImpl, new AccessTokenManagerImpl(
            container.resolve(AuthenticationClientImpl),
            this.config,
            container.resolve(this.getLoginStrategy()),
            container.resolve(HomebridgeImitationLogger)));

        container.registerInstance(AutomowerClientImpl, new RateLimitedAutomowerClient(
            this.config.appKey,
            settings.AUTOMOWER_CONNECT_API_BASE_URL,
            container.resolve(RetryerFetchClient),
            container.resolve(DefaultErrorFactory)));

        container.register(DeterministicMowerIsArrivingPolicy, {
            useValue: new DeterministicMowerIsArrivingPolicy()
        });

        container.register(DeterministicMowerIsPausedPolicy, {
            useValue: new DeterministicMowerIsPausedPolicy()
        });

        container.register(DeterministicMowerInMotionPolicy, {
            useValue: new DeterministicMowerInMotionPolicy()
        });

        container.register(DeterministicMowerFaultedPolicy, {
            useValue: new DeterministicMowerFaultedPolicy()
        });

        container.register(DeterministicScheduleEnabledPolicy, {
            useValue: new DeterministicScheduleEnabledPolicy()
        });

        container.register(DeterministicMowerTamperedPolicy, {
            useValue: new DeterministicMowerTamperedPolicy()
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
                context.resolve(HomebridgeImitationLogger),
                this,
                context.resolve(Y18nLocalization))
        });

        container.register(DiscoveryServiceImpl, {
            useFactory: (context) => new DiscoveryServiceImpl(
                context.resolve(GetMowersServiceImpl), 
                context.resolve(AutomowerAccessoryFactoryImpl),               
                context.resolve(HomebridgeImitationLogger))
        });

        container.register(AutomowerEventStreamClientImpl, {
            useFactory: (context) => new AutomowerEventStreamClientImpl(
                settings.AUTOMOWER_STREAM_API_BASE_URL, 
                context.resolve(HomebridgeImitationLogger))
        });

        container.register(EventStreamServiceImpl, {
            useFactory: (context) => new EventStreamServiceImpl(
                context.resolve(AccessTokenManagerImpl),
                context.resolve(AutomowerEventStreamClientImpl),
                context.resolve(HomebridgeImitationLogger),
                context.resolve(TimerImpl))
        });        
    }

    protected getLoginStrategy(): InjectionToken<OAuth2AuthorizationStrategy> {
        if (this.config.authentication_mode === 'client_credentials') {
            return ClientCredentialsAuthorizationStrategy;
        }

        return LegacyPasswordAuthorizationStrategy;
    }

    public resolve<T>(token: InjectionToken<T>): T {
        return container.resolve(token);
    }
}