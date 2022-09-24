import { AutomowerPlatformConfig } from '../../../automowerPlatform';
import { AuthenticationClient, OAuthToken } from '../../../clients/authenticationClient';
import { PlatformLogger } from '../../../diagnostics/platformLogger';
import { ErrorFactory } from '../../../errors/errorFactory';
import { OAuthTokenExchangeStrategy } from '../accessTokenManager';

/**
 * An {@link OAuthTokenExchangeStrategy} which exchanges username and password credentials for an {@link OAuthToken}.
 */
export class LegacyPasswordFlowStrategy implements OAuthTokenExchangeStrategy {
    public constructor(private errorFactory: ErrorFactory, private log: PlatformLogger) { }    

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

        // Let the user know this mechanism may not be supported for much longer.
        this.log.warn(
            'ATTENTION! You are currently using the legacy \'Password\' grant type to login to the Husqvarna APIs. ' + 
            'This authentication mechanism may not be supported shortly as Husqvarna has begun phased removal from their products. ' + 
            'Please migrate to using the \'Client Credentials\' type grant type instead, see documentation for more details.');

        return await client.exchangePassword(config.username, config.password);
    }
}