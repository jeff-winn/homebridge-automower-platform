import { AutomowerPlatformConfig } from '../../../automowerPlatform';
import { AuthenticationClient, OAuthToken } from '../../../clients/authenticationClient';
import { PlatformLogger } from '../../../diagnostics/platformLogger';
import { ErrorFactory } from '../../../errors/errorFactory';
import { OAuth2AuthorizationStrategy } from '../accessTokenManager';

/**
 * A legacy authorization strategy which exchanges the username and password for an authorization token.
 */
export class LegacyPasswordAuthorizationStrategy implements OAuth2AuthorizationStrategy {
    public constructor(private errorFactory: ErrorFactory, private log: PlatformLogger) { }
    
    public async authorize(config: AutomowerPlatformConfig, client: AuthenticationClient): Promise<OAuthToken> {
        if (config.appKey === undefined || config.appKey === '') {
            throw this.errorFactory.badConfigurationError(
                'The application key setting is missing, please check your configuration and try again.', 
                'CFG0002');
        }

        if (config.username === undefined || config.username === '') {
            throw this.errorFactory.badConfigurationError(
                'The username and/or password supplied were not valid, please check your configuration and try again.', 
                'CFG0002');
        }

        if (config.password === undefined || config.password === '') {
            throw this.errorFactory.badConfigurationError(
                'The username and/or password supplied were not valid, please check your configuration and try again.', 
                'CFG0002');
        }

        this.log.warn(
            'ATTENTION! You are currently using an authentication mode no longer supported by Husqvarna. ' + 
            'This authentication mode may suddenly stop working as Husqvarna has begun phased removal from their products. ' + 
            'Please migrate to another authentication mode at your earliest convenience, see documentation for more details.');

        return await client.exchangePassword(config.appKey, config.username, config.password);
    }
}