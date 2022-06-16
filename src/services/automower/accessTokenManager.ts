import { AuthenticationClient, OAuthToken } from '../../clients/authenticationClient';
import { AutomowerPlatformConfig } from '../../automowerPlatform';
import { AccessToken } from '../../model';
import { BadConfigurationError } from '../../errors/badConfigurationError';
import { PlatformLogger } from '../../diagnostics/platformLogger';

/**
 * A mechanism which manages the retrieval and renewal of an access token.
 */
export interface AccessTokenManager {
    /**
     * Gets the current token.
     */
    getCurrentToken(): Promise<AccessToken>;

    /**
     * Flags the token as invalid, which will cause the next attempt to get a new token.
     */
    flagAsInvalid(): void;

    /**
     * Logout the user.
     */
    logout(): Promise<void>;
}

export class AccessTokenManagerImpl implements AccessTokenManager {
    private currentToken?: OAuthToken;
    private expires?: Date;
    private invalidated = false;    

    public constructor(private client: AuthenticationClient, private config: AutomowerPlatformConfig, private log: PlatformLogger) { }

    public async getCurrentToken(): Promise<AccessToken> {
        if (!this.hasAlreadyLoggedIn() || this.isTokenInvalidated()) {
            let newToken: OAuthToken;

            if (this.hasAlreadyLoggedIn()) {
                newToken = await this.doRefreshToken();
            } else {
                newToken = await this.doLogin();
            }
            
            this.unsafeSetCurrentToken(newToken);
            this.setExpiration(newToken);
            
            this.flagAsValid();
        }

        if (this.currentToken === undefined) {
            throw new Error('The client is not logged in.');
        }

        return {
            value: this.currentToken.access_token,
            provider: this.currentToken.provider
        };
    }    

    protected unsafeGetCurrentToken(): OAuthToken | undefined {
        return this.currentToken;
    }

    protected unsafeSetCurrentToken(token: OAuthToken | undefined) {
        this.currentToken = token;
    }

    protected isTokenInvalidated(): boolean {
        const now = new Date();
        return (this.invalidated || (this.expires !== undefined && this.expires < now));
    }

    public hasAlreadyLoggedIn(): boolean {
        return this.currentToken !== undefined;
    }

    protected async doLogin(): Promise<OAuthToken> {
        this.log.debug('Logging into the Husqvarna platform...');

        if (this.config.username === undefined || this.config.username === '') {
            throw new BadConfigurationError(
                'The username and/or password setting is missing, please check your configuration and try again.', 'CFG0002');
        }

        if (this.config.password === undefined || this.config.password === '') {
            throw new BadConfigurationError(
                'The username and/or password setting is missing, please check your configuration and try again.', 'CFG0002');
        }

        const result = await this.client.login(this.config.username, this.config.password);

        this.log.debug('Logged in!');
        return result;
    }

    protected doRefreshToken(): Promise<OAuthToken> {       
        return this.client.refresh(this.currentToken!);
    }

    /**
     * Resets the existing token.
     */
    protected resetToken(): void {
        this.currentToken = undefined;
    }

    protected setExpiration(token: OAuthToken | undefined): void {
        if (token === undefined) {
            // The token has not been provided.
            this.expires = undefined;
            return;
        }

        if (token.expires_in === undefined) {
            return;
        }

        const expires = new Date();
        expires.setSeconds(expires.getSeconds() + token.expires_in);

        this.expires = expires;
    }

    public flagAsInvalid(): void {
        this.invalidated = true;
    }

    protected flagAsValid(): void {
        this.invalidated = false;
    }

    public async logout(): Promise<void> {
        const token = this.unsafeGetCurrentToken();
        if (token === undefined) {
            return;
        }

        this.log.debug('Logging out of the Husqvarna platform...');

        await this.client.logout(token);
        this.currentToken = undefined;

        this.log.debug('Logged out!');
    }
}