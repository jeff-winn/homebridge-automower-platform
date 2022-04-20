import { Logging } from 'homebridge';

import { AutomowerPlatformConfig } from '../automowerPlatformConfig';
import { AuthenticationClient } from '../clients/authenticationClient';
import { OAuthToken } from '../clients/model';

/**
 * A mechanism which manages the retrieval and renewal of an OAuth token.
 */
export interface OAuthTokenManager {
    /**
     * Gets the current token.
     */
    getCurrentToken(): Promise<OAuthToken>;

    /**
     * Flags the token as invalid, which will cause the next attempt to get a new token.
     */
    flagAsInvalid(): void;

    /**
     * Logout the user.
     */
    logout(): Promise<void>;
}

export class OAuthTokenManagerImpl implements OAuthTokenManager {
    private currentToken?: OAuthToken;
    private expires?: Date;
    private invalidated = false;    

    constructor(private client: AuthenticationClient, private config: AutomowerPlatformConfig, private log: Logging) { }

    async getCurrentToken(): Promise<OAuthToken> {
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

        return this.currentToken!;
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

    protected hasAlreadyLoggedIn(): boolean {
        return this.currentToken !== undefined;
    }

    protected async doLogin(): Promise<OAuthToken> {
        this.log.debug('Logging into the Husqvarna platform...');

        const result = await this.client.login(this.config.username, this.config.password);

        this.log.debug('Connected!');
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

    flagAsInvalid(): void {
        this.invalidated = true;
    }

    protected flagAsValid(): void {
        this.invalidated = false;
    }

    async logout(): Promise<void> {
        const token = this.unsafeGetCurrentToken();
        if (token === undefined) {
            return;
        }

        this.log.info('Logging out of the Husqvarna platform...');

        await this.client.logout(token);
        this.currentToken = undefined;

        this.log.info('Disconnected!');
    }
}