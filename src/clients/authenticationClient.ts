import { BodyInit } from 'node-fetch';
import { ErrorFactory } from '../errors/errorFactory';
import { DeviceType } from '../model';
import { PLUGIN_ID } from '../settings';
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
     * Optional. The token to use when refreshing the token.
     */
    refresh_token?: string;

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
 * Describes an authentication error response.
 */
export interface AuthenticationErrorResponse {
    /**
     * The error type.
     */
    error: string;
    
    /**
     * The error description.
     */
    error_description: string;

    /**
     * The error code.
     */
    error_code: string;
}

/**
 * A client used to authenticate to the Husqvarna platform.
 */
export interface AuthenticationClient {
    /**
     * Exchanges the app key and secret for an {@link OAuthToken}.
     * @param appKey The application key.
     * @param appSecret The application secret.
     * @param deviceType The type of device.
     */
    exchangeClientCredentialsAsync(appKey: string, appSecret: string, deviceType: DeviceType): Promise<OAuthToken>;

    /**
     * Logout the user.
     * @param token The OAuth token.
     */
    logoutClientCredentialsAsync(token: OAuthToken): Promise<void>;

    /**
     * Exchanges the password for an {@link OAuthToken}.
     * @param appKey The application key.
     * @param username The username.
     * @param password The password.
     * @param deviceType The type of device.
     */
    exchangePasswordAsync(appKey: string, username: string, password: string, deviceType: DeviceType): Promise<OAuthToken>;

    /**
     * Logout the user.
     * @param appKey The application key.
     * @param token The OAuth token.
     */
    logoutPasswordAsync(appKey: string, token: OAuthToken): Promise<void>;

    /**
     * Refreshes the token.
     * @param appKey The application key.
     * @param token The OAuth token to refresh.
     */
    refresh(appKey: string, token: OAuthToken): Promise<OAuthToken>;
}

export class AuthenticationClientImpl implements AuthenticationClient {
    public constructor(private baseUrl: string, private fetch: FetchClient, private errorFactory: ErrorFactory) { }

    public getBaseUrl(): string {
        return this.baseUrl;
    }

    public async exchangeClientCredentialsAsync(appKey: string, appSecret: string, deviceType: DeviceType): Promise<OAuthToken> {
        const body = this.encode({
            grant_type: 'client_credentials',
            client_id: appKey,
            client_secret: appSecret,
            scope: this.getScopes(deviceType)
        });

        return await this.exchange(body);
    }

    public async logoutClientCredentialsAsync(token: OAuthToken): Promise<void> {
        const req = {
            token: token.access_token
        };

        const response = await this.fetch.execute(this.baseUrl + '/oauth2/revoke', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token.access_token}`,
                'Authorization-Provider': token.provider,
                'X-Application-Id': PLUGIN_ID
            },
            body: JSON.stringify(req)
        });

        this.throwIfNotAuthorized(response);
        await this.throwIfStatusNotOk(response);
    }

    public async exchangePasswordAsync(appKey: string, username: string, password: string, deviceType: DeviceType): Promise<OAuthToken> {
        const body = this.encode({
            client_id: appKey,
            grant_type: 'password',
            username: username,
            password: password,
            scope: this.getScopes(deviceType)
        });

        return await this.exchange(body);
    }

    protected getScopes(deviceType: DeviceType): string {
        const scopes: string[] = [];
        scopes.push('iam:read');

        if (deviceType === DeviceType.AUTOMOWER) {
            scopes.push('amc:api');
        }

        if (deviceType === DeviceType.GARDENA) {
            scopes.push('sg-integration-api:read');
            scopes.push('sg-integration-api:write');
        }

        return scopes.join(' ');
    }

    private async exchange(body: BodyInit): Promise<OAuthToken> {
        const response = await this.fetch.execute(this.baseUrl + '/oauth2/token', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8',
                'X-Application-Id': PLUGIN_ID
            },
            body: body
        });

        await this.throwIfBadCredentials(response);
        this.throwIfNotAuthorized(response);
        await this.throwIfStatusNotOk(response);

        return await response.json() as OAuthToken;
    }

    private async throwIfBadCredentials(response: Response): Promise<void> {
        if (response.status === 400) {
            const error = await response.json() as AuthenticationErrorResponse;
            if (error.error_code === 'user.is.blocked') {
                throw this.errorFactory.accountLockedError('ACCOUNT_LOGIN_BLOCKED', 'CFG0002');
            } else if (error.error_code === 'simultaneous.logins') {
                throw this.errorFactory.simultaneousLoginError('SIMULTANEOUS_LOGINS_DETECTED', 'CFG0002');
            }
            
            throw this.errorFactory.badCredentialsError('BAD_CREDENTIALS', 'CFG0002');
        }
    }

    public async logoutPasswordAsync(appKey: string, token: OAuthToken): Promise<void> {
        const response = await this.fetch.execute(this.baseUrl + '/token/' + token.access_token, {
            method: 'DELETE',
            headers: {
                'X-Application-Id': PLUGIN_ID,
                'X-Api-Key': appKey,
                'Authorization-Provider': token.provider
            }
        });

        this.throwIfNotAuthorized(response);

        if (response.status !== 403) {
            // Dealing with an issue with the Husqvarna platform returning a bad HTTP status for client credentials based tokens.
            // See: https://github.com/jeff-winn/homebridge-automower-platform/issues/175
            await this.throwIfStatusNotOk(response);
        }
    }

    public async refresh(appKey: string, token: OAuthToken): Promise<OAuthToken> {
        const body = this.encode({
            client_id: appKey,
            grant_type: 'refresh_token',
            refresh_token: token.refresh_token
        });

        const response = await this.fetch.execute(this.baseUrl + '/oauth2/token', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8',
                'X-Application-Id': PLUGIN_ID
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
            throw this.errorFactory.badOAuthTokenError('INVALID_ACCESS_TOKEN', 'ERR0002');
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
            throw this.errorFactory.notAuthorizedError('NOT_AUTHORIZED', 'ERR0001');
        }
    }

    private async throwIfStatusNotOk(response: Response): Promise<void> {        
        if (!response.ok) {
            const msg = await response.text();
            throw new Error(`ERR: ${response.status} -> ${msg}`);
        }
    }
}