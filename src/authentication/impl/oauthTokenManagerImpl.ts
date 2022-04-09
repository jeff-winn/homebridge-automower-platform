import { AutomowerPlatformConfig } from '../../automowerPlatformConfig';
import { AuthenticationClient, OAuthToken } from '../../clients/authenticationClient';
import { OAuthTokenManager } from '../oauthTokenManager';

export class OAuthTokenManagerImpl implements OAuthTokenManager {
    private currentToken?: OAuthToken;
    private expires?: Date;
    private invalidated = false;    

    constructor(private client: AuthenticationClient, private config: AutomowerPlatformConfig) { }

    async getCurrentToken(): Promise<OAuthToken> {
        if (!this.hasAlreadyLoggedIn() || this.isTokenInvalidated()) {
            let newToken: OAuthToken;

            if (this.hasAlreadyLoggedIn()) {
                newToken = await this.doRefreshToken();
            } else {
                newToken = await this.doLogin();
            }
            
            this.setCurrentToken(newToken);
            this.setExpiration(newToken);
            
            this.flagAsValid();
        }

        return this.currentToken!;
    }

    protected setCurrentToken(token: OAuthToken | undefined) {
        this.currentToken = token;
    }

    protected isTokenInvalidated(): boolean {
        const now = new Date();
        return (this.invalidated || (this.expires !== undefined && this.expires < now));
    }

    protected hasAlreadyLoggedIn(): boolean {
        return this.currentToken !== undefined;
    }

    protected doLogin(): Promise<OAuthToken> {
        return this.client.login(this.config.username, this.config.password);
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

    flagAsInvalid(): void {
        this.invalidated = true;
    }

    protected flagAsValid(): void {
        this.invalidated = false;
    }
}