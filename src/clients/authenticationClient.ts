import { BodyInit } from 'node-fetch';
import { ErrorFactory } from '../errors/errorFactory';
import { FetchClient, Response } from './fetchClient';

/**
 * Describes an OAuth authentication token.
 */
export interface OAuthToken {
    /**
     * The access token.
     */
    access_token: string;

    /**
     * The scope.
     */
    scope: string;

    /**
     * The number of seconds until the token expires.
     */
    expires_in: number;
    
    /**
     * The token to use when refreshing the token.
     */
    refresh_token: string;

    /**
     * The provider.
     */
    provider: string;

    /**
     * The user identifier.
     */
    user_id: string;

    /**
     * The token type.
     */
    token_type: string;
}

/**
 * A client used to authenticate to the Husqvarna platform.
 */
export interface AuthenticationClient {
    /**
     * Login the user using the client credentials grant.
     * @param clientId The client id.
     * @param clientSecret The client secret.
     */
    exchangeClientCredentials(clientId: string, clientSecret: string): Promise<OAuthToken>;

    /**
     * Login the user using the password grant.
     * @param username The username.
     * @param password The password.
     */
    exchangePassword(username: string, password: string): Promise<OAuthToken>;

    /**
     * Logout the user.
     * @param token The OAuth token.
     */
    logout(token: OAuthToken): Promise<void>;

    /**
     * Refreshes the token.
     * @param token The OAuth token to refresh.
     */
    refresh(token: OAuthToken): Promise<OAuthToken>;
}

export class AuthenticationClientImpl implements AuthenticationClient {
    public constructor(private appKey: string | undefined, private baseUrl: string, 
        private fetch: FetchClient, private errorFactory: ErrorFactory) { }

    public getApplicationKey(): string | undefined {
        return this.appKey;
    }

    public getBaseUrl(): string {
        return this.baseUrl;
    }

    public async exchangeClientCredentials(clientId: string, clientSecret: string): Promise<OAuthToken> {
        if (clientId === '' || clientSecret === '') {
            throw this.errorFactory.badCredentialsError(
                'The client id and/or client secret supplied were not valid, please check your configuration and try again.',
                'CFG0004');
        }

        this.guardAppKeyMustBeProvided();

        const body = this.encode({
            client_id: clientId,
            client_secret: clientSecret,
            grant_type: 'client_credentials'
        });

        return await this.exchange(body);
    }

    public async exchangePassword(username: string, password: string): Promise<OAuthToken> {
        if (username === '' || password === '') {
            throw this.errorFactory.badCredentialsError(
                'The username and/or password supplied were not valid, please check your configuration and try again.', 
                'CFG0002');
        }

        this.guardAppKeyMustBeProvided();

        const body = this.encode({
            client_id: this.appKey!,
            grant_type: 'password',
            username: username,
            password: password
        });

        return await this.exchange(body);
    }

    private async exchange(body: BodyInit): Promise<OAuthToken> {
        const response = await this.fetch.execute(this.baseUrl + '/oauth2/token', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8'
            },
            body: body
        });

        this.throwIfBadCredentials(response);
        this.throwIfNotAuthorized(response);
        await this.throwIfStatusNotOk(response);

        return await response.json() as OAuthToken;
    }

    private throwIfBadCredentials(response: Response): void {
        if (response.status === 400) {
            throw this.errorFactory.badCredentialsError(
                'The username and/or password supplied were not valid, please check your configuration and try again.', 
                'CFG0002');
        }
    }

    public async logout(token: OAuthToken): Promise<void> {
        this.guardAppKeyMustBeProvided();

        const response = await this.fetch.execute(this.baseUrl + '/token/' + token.access_token, {
            method: 'DELETE',
            headers: {
                'X-Api-Key': this.appKey!,
                'Authorization-Provider': token.provider
            }
        });

        this.throwIfNotAuthorized(response);
        await this.throwIfStatusNotOk(response);
    }

    protected guardAppKeyMustBeProvided(): void {
        if (this.appKey === undefined || this.appKey === '') {
            throw this.errorFactory.badConfigurationError(
                'The appKey setting is missing, please check your configuration and try again.', 
                'CFG0001');
        }
    }

    public async refresh(token: OAuthToken): Promise<OAuthToken> {
        this.guardAppKeyMustBeProvided();

        const body = this.encode({
            client_id: this.appKey!,
            grant_type: 'refresh_token',
            refresh_token: token.refresh_token
        });

        const response = await this.fetch.execute(this.baseUrl + '/oauth2/token', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8'
            },
            body: body
        });

        this.throwIfBadToken(response);
        this.throwIfNotAuthorized(response);
        await this.throwIfStatusNotOk(response);

        return await response.json() as OAuthToken;
    }

    private throwIfBadToken(response: Response): void {
        if (response.status === 400) {
            throw this.errorFactory.badOAuthTokenError('The access token supplied was invalid.', 'ERR0002');
        }
    }
    
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    protected encode(payload: any): string {
        const result: string[] = [];

        for (const prop in payload) {
            const key = encodeURIComponent(prop);
            const value = encodeURIComponent(payload[prop]);

            result.push(key + '=' + value);
        }

        return result.join('&');
    }

    private throwIfNotAuthorized(response: Response): void {
        if (response.status === 401) {
            throw this.errorFactory.notAuthorizedError('The user is not authorized to perform the action requested.', 'ERR0001');
        }
    }

    private async throwIfStatusNotOk(response: Response): Promise<void> {        
        if (!response.ok) {
            const msg = await response.text();
            throw new Error(`ERR: ${response.status} -> ${msg}`);
        }
    }
}