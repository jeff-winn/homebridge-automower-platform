import 'reflect-metadata';

import { API, Logging } from 'homebridge';
import { container, InjectionToken } from 'tsyringe';

import * as settings from '../settings';

import { AutomowerAccessoryFactoryImpl } from '../automowerAccessoryFactory';
import { AutomowerPlatformConfig } from '../automowerPlatform';
import { AuthenticationClientImpl } from '../clients/authenticationClient';
import { AutomowerClientImpl } from '../clients/automower/automowerClient';
import { AutomowerEventStreamClientImpl } from '../clients/automower/automowerEventStreamClient';
import { RateLimitedAutomowerClient } from '../clients/automower/rateLimitedAutomowerClient';
import { RetryerFetchClient } from '../clients/fetchClient';
import { GardenaClient, GardenaClientImpl } from '../clients/gardena/gardenaClient';
import { FakeGardenaClientImpl } from '../clients/gardena/gardenaClient.fake';
import { DefaultLogger } from '../diagnostics/loggers/defaultLogger';
import { ForceDebugLogger } from '../diagnostics/loggers/forceDebugLogger';
import { HomebridgeImitationLogger } from '../diagnostics/loggers/homebridgeImitationLogger';
import { LoggerType, PlatformLogger } from '../diagnostics/platformLogger';
import { DefaultErrorFactory } from '../errors/errorFactory';
import { DiscoveryServiceFactoryImpl } from '../factories/discoveryServiceFactory';
import { EventStreamServiceFactoryImpl } from '../factories/eventStreamServiceFactory';
import { AuthenticationMode } from '../model';
import { AccessTokenManagerImpl, OAuth2AuthorizationStrategy } from '../services/husqvarna/accessTokenManager';
import { ClientCredentialsAuthorizationStrategy } from '../services/husqvarna/authorization/ClientCredentialsAuthorizationStrategy';
import { LegacyPasswordAuthorizationStrategy } from '../services/husqvarna/authorization/LegacyPasswordAuthorizationStrategy';
import { AutomowerGetMowersServiceImpl } from '../services/husqvarna/automower/automowerGetMowersServiceImpl';
import { ChangeSettingsServiceImpl } from '../services/husqvarna/automower/changeSettingsService';
import { MowerControlServiceImpl } from '../services/husqvarna/automower/mowerControlService';
import { EventStreamServiceImpl } from '../services/husqvarna/eventStreamService';
import { GardenaEventStreamService } from '../services/husqvarna/gardena/gardenaEventStreamService';
import { GardenaGetMowersService } from '../services/husqvarna/gardena/gardenaGetMowersService';
import { DeterministicMowerFaultedPolicy } from '../services/policies/mowerFaultedPolicy';
import { DeterministicMowerInMotionPolicy } from '../services/policies/mowerInMotionPolicy';
import { DeterministicMowerIsArrivingPolicy } from '../services/policies/mowerIsArrivingPolicy';
import { DeterministicMowerIsPausedPolicy } from '../services/policies/mowerIsPausedPolicy';
import { DeterministicMowerTamperedPolicy } from '../services/policies/mowerTamperedPolicy';
import { DeterministicScheduleEnabledPolicy } from '../services/policies/scheduleEnabledPolicy';
import { ConsoleWrapperImpl } from './consoleWrapper';
import { NodeJsEnvironment } from './environment';
import { Y18nLocalization } from './localization';
import { PlatformAccessoryFactoryImpl } from './platformAccessoryFactory';
import { TimerImpl } from './timer';

export interface PlatformContainer {
    registerEverything(): void;
    
    resolve<T>(token: InjectionToken<T>): T;

    getLoggerClass(): InjectionToken<PlatformLogger>;
}

export class PlatformContainerImpl implements PlatformContainer {
    public constructor(private config: AutomowerPlatformConfig, private api: API, private log: Logging) { }

    public registerEverything(): void {
        container.register(NodeJsEnvironment, {
            useValue: new NodeJsEnvironment()
        });

        container.register(ConsoleWrapperImpl, {
            useValue: new ConsoleWrapperImpl() 
        });

        container.register(Y18nLocalization, {
            useValue: new Y18nLocalization(
                this.config.lang, 
                container.resolve(NodeJsEnvironment))
        });

        container.register(DefaultLogger, {
            useFactory: (context) => new DefaultLogger(
                this.log,
                context.resolve(Y18nLocalization),
                context.resolve(NodeJsEnvironment))
        });

        container.register(ForceDebugLogger, {
            useFactory: (context) => new ForceDebugLogger(
                context.resolve(ConsoleWrapperImpl),
                this.log,
                context.resolve(Y18nLocalization),
                context.resolve(NodeJsEnvironment))
        });

        container.register(HomebridgeImitationLogger, {
            useFactory: (context) => new HomebridgeImitationLogger(
                context.resolve(NodeJsEnvironment),
                settings.PLATFORM_NAME, 
                this.config.name,
                context.resolve(ConsoleWrapperImpl),
                context.resolve(Y18nLocalization))
        });

        container.register(RetryerFetchClient, {
            useFactory: (context) => new RetryerFetchClient(
                context.resolve(this.getLoggerClass()))
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
                context.resolve(this.getLoggerClass()))
        });

        container.register(ClientCredentialsAuthorizationStrategy, {
            useFactory: (context) => new ClientCredentialsAuthorizationStrategy(
                context.resolve(DefaultErrorFactory))
        });
        
        container.registerInstance(AccessTokenManagerImpl, new AccessTokenManagerImpl(
            container.resolve(AuthenticationClientImpl),
            this.config,
            container.resolve(this.getLoginStrategyClass()),
            container.resolve(this.getLoggerClass())));

        container.registerInstance(GardenaClientImpl, new GardenaClientImpl(
            this.config.appKey,
            settings.GARDENA_SMART_SYSTEM_API_BASE_URL,
            container.resolve(RetryerFetchClient),
            container.resolve(DefaultErrorFactory)));

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
        
        container.register(GardenaGetMowersService, {
            useFactory: (context) => new GardenaGetMowersService(
                context.resolve(AccessTokenManagerImpl),
                context.resolve(this.getGardenaClientClass()),
                context.resolve(this.getLoggerClass()))
        });
        
        container.register(AutomowerGetMowersServiceImpl, {
            useFactory: (context) => new AutomowerGetMowersServiceImpl(
                context.resolve(AccessTokenManagerImpl),
                context.resolve(AutomowerClientImpl),
                context.resolve(this.getLoggerClass()))
        });

        container.register(ChangeSettingsServiceImpl, {
            useFactory: (context) => new ChangeSettingsServiceImpl(
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
                context.resolve(this.getLoggerClass()),
                this,
                context.resolve(Y18nLocalization))
        });

        container.register(DiscoveryServiceFactoryImpl, {
            useFactory: (context) => new DiscoveryServiceFactoryImpl(
                this.config, context.resolve(DefaultErrorFactory))
        });

        container.register(EventStreamServiceFactoryImpl, {
            useFactory: (context) => new EventStreamServiceFactoryImpl(
                this.config, context.resolve(DefaultErrorFactory))
        });

        container.register(AutomowerEventStreamClientImpl, {
            useFactory: (context) => new AutomowerEventStreamClientImpl(
                settings.AUTOMOWER_STREAM_API_BASE_URL, 
                context.resolve(this.getLoggerClass()))
        });

        container.register(EventStreamServiceImpl, {
            useFactory: (context) => new EventStreamServiceImpl(
                context.resolve(AccessTokenManagerImpl),
                context.resolve(AutomowerEventStreamClientImpl),
                context.resolve(this.getLoggerClass()),
                context.resolve(TimerImpl))                
        });

        container.register(GardenaEventStreamService, {
            useValue: new GardenaEventStreamService()
        });
    }

    protected getGardenaClientClass(): InjectionToken<GardenaClient> {
        const env = container.resolve(NodeJsEnvironment);
        if (env.isDevelopmentEnvironment()) {
            return FakeGardenaClientImpl;
        }

        return GardenaClientImpl;
    }

    public getLoggerClass(): InjectionToken<PlatformLogger> {
        if (this.config.logger_type !== undefined) {
            if (this.config.logger_type === LoggerType.IMITATION) {
                return HomebridgeImitationLogger;
            } else if (this.config.logger_type === LoggerType.FORCE_DEBUG) {
                return ForceDebugLogger;
            }            
        }

        return DefaultLogger;
    }

    protected getLoginStrategyClass(): InjectionToken<OAuth2AuthorizationStrategy> {
        if (this.config.getAuthenticationModeOrDefault() === AuthenticationMode.CLIENT_CREDENTIALS) {
            return ClientCredentialsAuthorizationStrategy;
        }

        return LegacyPasswordAuthorizationStrategy;
    }

    public resolve<T>(token: InjectionToken<T>): T {
        return container.resolve(token);
    }
}