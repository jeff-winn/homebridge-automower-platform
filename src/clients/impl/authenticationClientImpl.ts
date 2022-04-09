import { AuthenticationClient, OAuthToken } from '../authenticationClient';
import { NotAuthorizedError } from '../notAuthorizedError';
import fetch, { Response } from 'node-fetch';

export class AuthenticationClientImpl implements AuthenticationClient {
    constructor(private appKey: string, private baseUrl: string) { }

    getApplicationKey(): string {
        return this.appKey;
    }

    getBaseUrl(): string {
        return this.baseUrl;
    }

    async login(username: string, password: string): Promise<OAuthToken> {
        const body = this.encode({
            client_id: this.appKey,
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

        this.throwIfStatusNotOk(response);

        return await response.json() as OAuthToken;
    }

    async logout(token: OAuthToken): Promise<void> {
        const response = await fetch(this.baseUrl + '/token/' + token.access_token, {
            method: 'DELETE',
            headers: {
                'x-api-key': this.appKey,
                'authorization-provider': token.provider
            }
        });

        this.throwIfStatusNotOk(response);
    }

    async refresh(token: OAuthToken): Promise<OAuthToken> {
        const body = this.encode({
            client_id: this.appKey,
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
        this.throwIfNotAuthorized(response);
        
        if (!response.ok) {
            throw new Error(`ERR: ${response.status}`);
        }
    }
}