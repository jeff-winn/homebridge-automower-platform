import fetch, { Response } from 'node-fetch';

import { NotAuthorizedError } from '../errors/notAuthorizedError';
import { BadCredentialsError } from '../errors/badCredentialsError';
import { BadConfigurationError } from '../errors/badConfigurationError';

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
     * Login the user.
     * @param username The username.
     * @param password The password.
     */
    login(username: string, password: string): Promise<OAuthToken>;

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
    public constructor(private appKey: string | undefined, private baseUrl: string) { }

    public getApplicationKey(): string | undefined {
        return this.appKey;
    }

    public getBaseUrl(): string {
        return this.baseUrl;
    }

    public async login(username: string, password: string): Promise<OAuthToken> {
        if (username === '') {
            throw new Error('username cannot be empty.');
        }

        if (password === '') {
            throw new Error('password cannot be empty.');
        }

        this.guardAppKeyMustBeProvided();

        const body = this.encode({
            client_id: this.appKey!,
            grant_type: 'password',
            username: username,
            password: password
        });

        const response = await fetch(this.baseUrl + '/oauth2/token', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8'
            },
            body: body
        });

        this.throwIfBadCredentials(response);
        this.throwIfNotAuthorized(response);
        this.throwIfStatusNotOk(response);

        return await response.json() as OAuthToken;
    }

    private throwIfBadCredentials(response: Response): void {
        if (response.status === 400) {
            throw new BadCredentialsError(
                'The username and/or password supplied were not valid, please check your configuration and try again.');
        }
    }

    public async logout(token: OAuthToken): Promise<void> {
        this.guardAppKeyMustBeProvided();

        const response = await fetch(this.baseUrl + '/token/' + token.access_token, {
            method: 'DELETE',
            headers: {
                'X-Api-Key': this.appKey!,
                'Authorization-Provider': token.provider
            }
        });

        this.throwIfNotAuthorized(response);
        this.throwIfStatusNotOk(response);
    }

    protected guardAppKeyMustBeProvided(): void {
        if (this.appKey === undefined || this.appKey === '') {
            throw new BadConfigurationError('The appKey setting is missing, please check your configuration and try again.');
        }
    }

    public async refresh(token: OAuthToken): Promise<OAuthToken> {
        this.guardAppKeyMustBeProvided();

        const body = this.encode({
            client_id: this.appKey!,
            grant_type: 'refresh_token',
            refresh_token: token.refresh_token
        });

        const response = await fetch(this.baseUrl + '/oauth2/token', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8'
            },
            body: body
        });

        this.throwIfNotAuthorized(response);
        this.throwIfStatusNotOk(response);

        return await response.json() as OAuthToken;
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
            throw new NotAuthorizedError();
        }
    }

    private throwIfStatusNotOk(response: Response): void {        
        if (!response.ok) {
            throw new Error(`ERR: ${response.status}`);
        }
    }
}