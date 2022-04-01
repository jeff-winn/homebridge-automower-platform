import { AuthenticationClient, OAuthToken } from "./authenticationClient";
import fetch, { Response } from 'node-fetch';

export class AuthenticationClientImpl implements AuthenticationClient {
    constructor(private appKey: string, private baseUrl: string) { }

    async login(username: string, password: string): Promise<OAuthToken> {
        var body = this.encode({
            client_id: this.appKey,
            grant_type: 'password',
            username: username,
            password: password
        });

        var response = await fetch(this.baseUrl + '/oauth2/token', {
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
        var response = await fetch(this.baseUrl + '/token/' + token.access_token, {
            method: 'DELETE',
            headers: {
                'x-api-key': this.appKey,
                'authorization-provider': token.provider
            }
        });

        this.throwIfStatusNotOk(response);
    }

    async refresh(token: OAuthToken): Promise<OAuthToken> {
        var body = this.encode({
            client_id: this.appKey,
            grant_type: 'refresh_token',
            refresh_token: token.refresh_token
        });

        var response = await fetch(this.baseUrl + '/oauth2/token', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8'
            },
            body: body
        });

        this.throwIfStatusNotOk(response);

        return await response.json() as OAuthToken;
    }
    
    protected encode(payload: any): string {
        var result: string[] = [];

        for (var prop in payload) {
            var key = encodeURIComponent(prop);
            var value = encodeURIComponent(payload[prop]);

            result.push(key + "=" + value);
        }

        return result.join("&");
    }

    private throwIfStatusNotOk(response: Response): void {
        if (!response.ok)
        {
            throw `ERR: ${response.status}`
        }
    }
}