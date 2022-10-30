import { AutomowerPlatformConfig } from '../../../automowerPlatform';
import { AuthenticationClient, OAuthToken } from '../../../clients/authenticationClient';
import { ErrorFactory } from '../../../errors/errorFactory';
import { OAuth2FlowStrategy } from '../accessTokenManager';

/**
 * A legacy authorization flow which exchanges the username and password for an authorization token.
 */
export class LegacyPasswordFlowStrategy implements OAuth2FlowStrategy {
    public constructor(private errorFactory: ErrorFactory) { }
    
    public async exchange(config: AutomowerPlatformConfig, client: AuthenticationClient): Promise<OAuthToken> {
        if (config.appKey === undefined || config.appKey === '') {
            throw this.errorFactory.badConfigurationError(
                'The appKey setting is missing, please check your configuration and try again.', 
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

        return await client.exchangePassword(config.appKey, config.username, config.password);
    }
}