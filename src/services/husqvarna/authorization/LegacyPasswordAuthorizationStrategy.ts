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
            throw this.errorFactory.badConfigurationError('APP_KEY_MISSING', 'CFG0002');
        }

        if (config.username === undefined || config.username === '') {
            throw this.errorFactory.badConfigurationError('USERNAME_PASSWORD_INVALID', 'CFG0002');
        }

        if (config.password === undefined || config.password === '') {
            throw this.errorFactory.badConfigurationError('USERNAME_PASSWORD_INVALID', 'CFG0002');
        }

        this.log.warn('AUTHENTICATION_SCHEME_NOT_SUPPORTED');

        return await client.exchangePassword(config.appKey, config.username, config.password, config.getDeviceTypeOrDefault());
    }
}