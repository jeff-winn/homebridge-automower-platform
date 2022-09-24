import { AutomowerPlatformConfig } from '../../../automowerPlatform';
import { AuthenticationClient, OAuthToken } from '../../../clients/authenticationClient';
import { ErrorFactory } from '../../../errors/errorFactory';
import { OAuthTokenExchangeStrategy } from '../accessTokenManager';

/**
 * An {@link OAuthTokenExchangeStrategy} which exchanges username and password credentials for an {@link OAuthToken}.
 */
export class PasswordFlowStrategy implements OAuthTokenExchangeStrategy {
    public constructor(private errorFactory: ErrorFactory) { }    

    public async exchange(config: AutomowerPlatformConfig, client: AuthenticationClient): Promise<OAuthToken> {
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

        return await client.exchangePassword(config.username, config.password);
    }
}