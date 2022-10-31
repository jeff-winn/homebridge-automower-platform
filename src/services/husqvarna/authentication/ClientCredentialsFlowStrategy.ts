import { AutomowerPlatformConfig } from '../../../automowerPlatform';
import { AuthenticationClient, OAuthToken } from '../../../clients/authenticationClient';
import { ErrorFactory } from '../../../errors/errorFactory';
import { OAuth2FlowStrategy } from '../accessTokenManager';

/**
 * An authorization flow which exchanges the application key and secret for an authorization token.
 */
export class ClientCredentialsFlowStrategy implements OAuth2FlowStrategy {
    public constructor(private errorFactory: ErrorFactory) { }

    public async exchange(config: AutomowerPlatformConfig, client: AuthenticationClient): Promise<OAuthToken> {
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