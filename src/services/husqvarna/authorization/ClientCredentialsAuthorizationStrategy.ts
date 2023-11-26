import { AutomowerPlatformConfig } from '../../../automowerPlatform';
import { AuthenticationClient, OAuthToken } from '../../../clients/authenticationClient';
import { ErrorFactory } from '../../../errors/errorFactory';
import { OAuth2AuthorizationStrategy } from '../accessTokenManager';

/**
 * An authorization strategy which exchanges the application key and secret for an authorization token.
 */
export class ClientCredentialsAuthorizationStrategy implements OAuth2AuthorizationStrategy {
    public constructor(private errorFactory: ErrorFactory, private config: AutomowerPlatformConfig) { }

    public async authorizeAsync(client: AuthenticationClient): Promise<OAuthToken> {
        this.guardAppKeyMustBeProvided();
        this.guardApplicationSecretMustBeProvided();
        
        return await client.exchangeClientCredentialsAsync(this.config.appKey!, this.config.application_secret!, this.config.getDeviceTypeOrDefault());
    }

    private guardAppKeyMustBeProvided(): void {
        if (this.config.appKey === undefined || this.config.appKey === '') {
            throw this.errorFactory.badConfigurationError('APP_KEY_MISSING', 'CFG0002');
        }
    }

    private guardApplicationSecretMustBeProvided(): void {
        if (this.config.application_secret === undefined || this.config.application_secret === '') {
            throw this.errorFactory.badConfigurationError('APP_SECRET_MISSING', 'CFG0002');
        }
    }

    public async deauthorizeAsync(token: OAuthToken, client: AuthenticationClient): Promise<void> {
        await client.logoutClientCredentialsAsync(token);
    }
}