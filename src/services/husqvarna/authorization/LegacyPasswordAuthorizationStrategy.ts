import { AutomowerPlatformConfig } from '../../../automowerPlatform';
import { AuthenticationClient, OAuthToken } from '../../../clients/authenticationClient';
import { PlatformLogger } from '../../../diagnostics/platformLogger';
import { ErrorFactory } from '../../../errors/errorFactory';
import { OAuth2AuthorizationStrategy } from '../accessTokenManager';

/**
 * A legacy authorization strategy which exchanges the username and password for an authorization token.
 */
export class LegacyPasswordAuthorizationStrategy implements OAuth2AuthorizationStrategy {
    public constructor(private errorFactory: ErrorFactory, private log: PlatformLogger, private config: AutomowerPlatformConfig) { }
    
    public async authorizeAsync(client: AuthenticationClient): Promise<OAuthToken> {
        this.guardAppKeyMustBeProvided();
        this.guardUserNameMustBeProvided();        
        this.guardPasswordMustBeProvided();        

        this.log.warn('AUTHENTICATION_SCHEME_NOT_SUPPORTED');

        return await client.exchangePasswordAsync(this.config.appKey!, this.config.username!, this.config.password!, this.config.getDeviceTypeOrDefault());
    }    

    public async deauthorizeAsync(token: OAuthToken, client: AuthenticationClient): Promise<void> {
        this.guardAppKeyMustBeProvided();

        await client.logoutPassword(this.config.appKey!, token);
    }

    private guardAppKeyMustBeProvided(): void {
        if (this.config.appKey === undefined || this.config.appKey === '') {
            throw this.errorFactory.badConfigurationError('APP_KEY_MISSING', 'CFG0002');
        }
    }

    private guardUserNameMustBeProvided(): void {
        if (this.config.username === undefined || this.config.username === '') {
            throw this.errorFactory.badConfigurationError('USERNAME_PASSWORD_INVALID', 'CFG0002');
        }
    }

    private guardPasswordMustBeProvided(): void {
        if (this.config.password === undefined || this.config.password === '') {
            throw this.errorFactory.badConfigurationError('USERNAME_PASSWORD_INVALID', 'CFG0002');
        }
    }
}