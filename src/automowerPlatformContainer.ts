import { Logging } from 'homebridge';
import { container, DependencyContainer, InjectionToken } from 'tsyringe';
import { OAuthTokenManagerImpl } from './authentication/impl/oauthTokenManagerImpl';
import { AutomowerPlatformConfig } from './automowerPlatformConfig';
import { AuthenticationClientImpl } from './clients/impl/authenticationClientImpl';
import { AutomowerClientImpl } from './clients/impl/automowerClientImpl';
import { GetMowersServiceImpl } from './services/automower/impl/getMowersServiceImpl';
import { PauseMowerServiceImpl } from './services/automower/impl/pauseMowerServiceImpl';
import * as constants from './constants';

export class AutomowerPlatformContainer {
    private readonly container: DependencyContainer;

    constructor(private config: AutomowerPlatformConfig, private log: Logging) { 
        this.container = container;
    }

    registerEverything(): void {
        this.log.debug('Registering classes to the DI container...');

        this.container.register(AutomowerClientImpl, {
            useValue: new AutomowerClientImpl(
                this.config.appKey,
                constants.AUTOMOWER_CONNECT_API_BASE_URL
            )
        });
    
        this.container.register(AuthenticationClientImpl, {
            useValue: new AuthenticationClientImpl(
                this.config.appKey,
                constants.AUTHENTICATION_API_BASE_URL
            )
        });
    
        this.container.register(OAuthTokenManagerImpl, {
            useFactory: (context) => new OAuthTokenManagerImpl(
                context.resolve(AuthenticationClientImpl),
                this.config,
                this.log)
        });

        this.container.register(GetMowersServiceImpl, {
            useFactory: (context) => new GetMowersServiceImpl(
                context.resolve(OAuthTokenManagerImpl),
                context.resolve(AutomowerClientImpl)
            )
        });

        this.container.register(PauseMowerServiceImpl, {
            useFactory: (context) => new PauseMowerServiceImpl(
                context.resolve(OAuthTokenManagerImpl),
                context.resolve(AutomowerClientImpl)
            )
        });

        this.log.debug('Completed DI container registrations.');
    }

    resolve<T>(token: InjectionToken<T>): T {
        return this.container.resolve(token);
    }
}