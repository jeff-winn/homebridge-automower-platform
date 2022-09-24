import { AutomowerPlatformConfig } from '../../../automowerPlatform';
import { AuthenticationClient, OAuthToken } from '../../../clients/authenticationClient';
import { ErrorFactory } from '../../../errors/errorFactory';
import { OAuthTokenExchangeStrategy } from '../accessTokenManager';

/**
 * An {@link OAuthTokenExchangeStrategy} which exchanges username and password credentials for an {@link OAuthToken}.
 */
export class ClientCredentialsFlowStrategy implements OAuthTokenExchangeStrategy {
    public constructor(private errorFactory: ErrorFactory) { }

    public async exchange(config: AutomowerPlatformConfig, client: AuthenticationClient): Promise<OAuthToken> {
        const credentials = config.client_credentials;
        if (credentials === undefined) {
            throw this.errorFactory.badConfigurationError(
                'The client credentials configuration settings are required when using client credentials authentication.',
                'CFG0003');
        }

        if (credentials.clientId === undefined || credentials.clientSecret === undefined) {
            throw this.errorFactory.badCredentialsError(
                'The client id and/or client secret supplied were not valid, please check your configuration and try again.', 
                'CFG0004');
        }
        
        return await client.exchangeClientCredentials(credentials.clientId, credentials.clientSecret);
    }
}