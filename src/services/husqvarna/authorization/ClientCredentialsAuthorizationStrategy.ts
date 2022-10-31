import { AutomowerPlatformConfig } from '../../../automowerPlatform';
import { AuthenticationClient, OAuthToken } from '../../../clients/authenticationClient';
import { ErrorFactory } from '../../../errors/errorFactory';
import { OAuth2AuthorizationStrategy } from '../accessTokenManager';

/**
 * An authorization strategy which exchanges the application key and secret for an authorization token.
 */
export class ClientCredentialsAuthorizationStrategy implements OAuth2AuthorizationStrategy {
    public constructor(private errorFactory: ErrorFactory) { }

    public async authorize(config: AutomowerPlatformConfig, client: AuthenticationClient): Promise<OAuthToken> {
        if (config.appKey === undefined || config.appKey === '') {
            throw this.errorFactory.badConfigurationError(
                'The application key setting is missing, please check your configuration and try again.', 
                'CFG0002');
        }

        if (config.application_secret === undefined || config.application_secret === '') {
            throw this.errorFactory.badConfigurationError(
                'The application secret setting is missing, please check your configuration and try again.', 
                'CFG0002');
        }

        return await client.exchangeClientCredentials(config.appKey, config.application_secret);
    }    
}