import { AutomowerPlatformConfig } from "../../automowerPlatformConfig";
import { AuthenticationClient, OAuthToken } from "../../clients/authenticationClient";
import { OAuthTokenManager } from "../oauthTokenManager";

export class OAuthTokenManagerImpl implements OAuthTokenManager {
    private currentToken?: OAuthToken;
    private expires?: Date;
    private invalidated: boolean = false;    

    constructor(private client: AuthenticationClient, private config: AutomowerPlatformConfig) { }

    async getCurrentToken(): Promise<OAuthToken> {
        if (!this.hasAlreadyLoggedIn() || this.isTokenInvalidated()) {
            let newToken: OAuthToken;

            if (this.hasAlreadyLoggedIn()) {
                newToken = await this.doRefreshToken();
            }
            else {
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
        let now = new Date();
        return (this.invalidated || (this.expires !== undefined && this.expires < now));
    }

    protected hasAlreadyLoggedIn(): boolean {
        return this.currentToken !== undefined;
    }

    protected async doLogin(): Promise<OAuthToken> {
        return await this.client.login(this.config.username, this.config.password);
    }

    protected async doRefreshToken(): Promise<OAuthToken> {       
        return await this.client.refresh(this.currentToken!);
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

        let expires = new Date();
        expires.setSeconds(expires.getSeconds() + token.expires_in);

        this.expires = expires;
    }

    flagAsInvalid(): void {
        this.invalidated = true;
    }

    protected flagAsValid(): void {
        this.invalidated = false;
    }
};