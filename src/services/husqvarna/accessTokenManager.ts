import { AutomowerPlatformConfig } from '../../automowerPlatform';
import { AuthenticationClient, OAuthToken } from '../../clients/authenticationClient';
import { PlatformLogger } from '../../diagnostics/platformLogger';
import { AccessToken } from '../../model';

/**
 * A mechanism which authorizes the client.
 */
export interface OAuth2AuthorizationStrategy {
    /**
     * Exchanges the configuration settings for an {@link OAuthToken}.
     * @param config The configuration settings.
     * @param client The authentication client.
     */
    authorize(config: AutomowerPlatformConfig, client: AuthenticationClient): Promise<OAuthToken>;
}

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

    public constructor(private client: AuthenticationClient, private config: AutomowerPlatformConfig, 
        private login: OAuth2AuthorizationStrategy, private log: PlatformLogger) { }

    public async getCurrentToken(): Promise<AccessToken> {
        if (this.shouldRefreshToken()) {
            await this.refreshToken();
        }

        const current = this.getRequiredCurrentToken();
        return {
            value: current.access_token,
            provider: current.provider
        };
    }

    protected async refreshToken(): Promise<void> {
        let newToken: OAuthToken;

        if (this.canTokenBeRefreshed() && !this.isTokenInvalidated()) {
            newToken = await this.doRefreshToken();
        } else {
            newToken = await this.doLogin();
        }
        
        this.unsafeSetCurrentToken(newToken);
        this.setExpiration(newToken);
        
        this.flagAsValid();
    }

    protected getRequiredCurrentToken(): OAuthToken {
        if (this.currentToken === undefined) {
            throw new Error('The client is not logged in.');
        }
        
        return this.currentToken;
    }
    
    protected shouldRefreshToken() {
        return !this.hasAlreadyLoggedIn() || this.isTokenInvalidated() || this.hasTokenExpired();
    }

    protected unsafeGetCurrentToken(): OAuthToken | undefined {
        return this.currentToken;
    }

    protected unsafeSetCurrentToken(token: OAuthToken | undefined) {
        this.currentToken = token;
    }

    protected isTokenInvalidated(): boolean {
        return this.invalidated;
    }

    protected hasTokenExpired(): boolean {
        const now = new Date();
        return this.expires !== undefined && this.expires < now;
    }

    public hasAlreadyLoggedIn(): boolean {
        return this.currentToken !== undefined;
    }

    protected async doLogin(): Promise<OAuthToken> {
        this.log.debug('Logging into the Husqvarna platform...');

        const token = await this.login.authorize(this.config, this.client);
        
        this.log.debug('Logged in!');
        return token;
    }

    protected async doRefreshToken(): Promise<OAuthToken> {
        this.log.debug('Refreshing the current token...');

        const newToken = await this.client.refresh(this.config.appKey!, this.currentToken!);

        this.log.debug('Refreshed the token!');
        return newToken;
    }

    protected canTokenBeRefreshed(): boolean {
        return this.currentToken !== undefined && this.currentToken.refresh_token !== undefined;
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

        // Remove an hour from the actual expiration time as the Husqvarna auth provider will expire the token 
        // at that exact instant, making it unusable to refresh. This should give the retry logic an hour to get
        // the token refreshed successfully.
        const expires_in = token.expires_in - 3600;

        const expires = new Date();
        expires.setSeconds(expires.getSeconds() + expires_in);

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

        await this.client.logout(this.config.appKey!, token);
        this.currentToken = undefined;

        this.log.debug('Logged out!');
    }
}