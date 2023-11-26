import { It, Mock } from 'moq.ts';

import * as constants from '../../src/settings';

import { AuthenticationClientImpl, AuthenticationErrorResponse, OAuthToken } from '../../src/clients/authenticationClient';
import { FetchClient, Response } from '../../src/clients/fetchClient';
import { AccountLockedError } from '../../src/errors/accountLockedError';
import { BadCredentialsError } from '../../src/errors/badCredentialsError';
import { BadOAuthTokenError } from '../../src/errors/badOAuthTokenError';
import { ErrorFactory } from '../../src/errors/errorFactory';
import { NotAuthorizedError } from '../../src/errors/notAuthorizedError';
import { SimultaneousLoginError } from '../../src/errors/simultaneousLoginError';
import { DeviceType } from '../../src/model';

describe('AuthenticationClientImpl', () => {
    // These values should come from your Husqvarna account, and be placed in the .env file at the root of the workspace.
    const APPKEY = 'APPKEY';
    const USERNAME = 'USERNAME';
    const PASSWORD = 'PASSWORD';

    let fetch: Mock<FetchClient>;
    let errorFactory: Mock<ErrorFactory>;

    let target: AuthenticationClientImpl;

    beforeEach(async () => {
        fetch = new Mock<FetchClient>();
        errorFactory = new Mock<ErrorFactory>();

        target = new AuthenticationClientImpl(constants.AUTHENTICATION_API_BASE_URL, fetch.object(), errorFactory.object());
    });

    it('should initalize correctly', () => {
        expect(target.getBaseUrl()).toBe(constants.AUTHENTICATION_API_BASE_URL);
    });

    it('should throw an account locked error on 400 response when user is blocked for password exchange', async () => {
        errorFactory.setup(o => o.accountLockedError(It.IsAny(), It.IsAny())).returns(new AccountLockedError('hello', '12345'));

        const error: AuthenticationErrorResponse = {
            error: 'invalid_request',
            error_code: 'user.is.blocked',
            error_description: 'Blocked for too many login-attempts'
        };
            
        const body = JSON.stringify(error);

        const response = new Response(body, {
            headers: { },
            size: 0,
            status: 400,
            timeout: 0,
            url: 'http://localhost',
        });       

        fetch.setup(o => o.execute(It.IsAny(), It.IsAny())).returns(Promise.resolve(response));

        await expect(target.exchangePasswordAsync(APPKEY, USERNAME, PASSWORD, DeviceType.AUTOMOWER)).rejects.toThrowError(AccountLockedError);
    });

    it('should throw a bad credentials error on 400 response when incorrect response body for password exchange', async () => {
        errorFactory.setup(o => o.badCredentialsError(It.IsAny(), It.IsAny())).returns(new BadCredentialsError('hello', '12345'));

        const response = new Response('{}', {
            headers: { },
            size: 0,
            status: 400,
            timeout: 0,
            url: 'http://localhost',
        });       

        fetch.setup(o => o.execute(It.IsAny(), It.IsAny())).returns(Promise.resolve(response));

        await expect(target.exchangePasswordAsync(APPKEY, USERNAME, PASSWORD, DeviceType.AUTOMOWER)).rejects.toThrowError(BadCredentialsError);
    });

    it('should throw a bad credentials error on 400 response when unknown error for password exchange', async () => {
        errorFactory.setup(o => o.badCredentialsError(It.IsAny(), It.IsAny())).returns(new BadCredentialsError('hello', '12345'));

        const error: AuthenticationErrorResponse = {
            error: 'hello',
            error_code: 'unknown',
            error_description: 'Yeah this broke'
        };
            
        const body = JSON.stringify(error);

        const response = new Response(body, {
            headers: { },
            size: 0,
            status: 400,
            timeout: 0,
            url: 'http://localhost',
        });       

        fetch.setup(o => o.execute(It.IsAny(), It.IsAny())).returns(Promise.resolve(response));

        await expect(target.exchangePasswordAsync(APPKEY, USERNAME, PASSWORD, DeviceType.AUTOMOWER)).rejects.toThrowError(BadCredentialsError);
    });

    it('should throw a not authorized error on 401 response', async () => {
        errorFactory.setup(o => o.notAuthorizedError(It.IsAny(), It.IsAny()))
            .returns(new NotAuthorizedError('hello', '12345'));

        const response = new Response(undefined, {
            headers: { },
            size: 0,
            status: 401,
            timeout: 0,
            url: 'http://localhost',
        });

        fetch.setup(o => o.execute(It.IsAny(), It.IsAny())).returns(Promise.resolve(response));

        await expect(target.exchangePasswordAsync(APPKEY, USERNAME, PASSWORD, DeviceType.AUTOMOWER)).rejects.toThrowError(NotAuthorizedError);
    });

    it('should throw an error when response is not ok', async () => {
        const response = new Response(undefined, {
            headers: { },
            size: 0,
            status: 500,
            timeout: 0,
            url: 'http://localhost',
        });

        fetch.setup(o => o.execute(It.IsAny(), It.IsAny())).returns(Promise.resolve(response));

        await expect(target.exchangePasswordAsync(APPKEY, USERNAME, PASSWORD, DeviceType.AUTOMOWER)).rejects.toThrowError(Error);
    });

    it('should return an oauth token when logged in with automower client credentials successfully', async () => {
        const token: OAuthToken = {
            access_token: 'access token',
            expires_in: 100,
            provider: 'provider',
            refresh_token: 'refresh token',
            scope: 'my scope',
            token_type: 'all the things',
            user_id: '12345'
        };

        const body = JSON.stringify(token);

        const response = new Response(body, {
            headers: { },
            size: 0,
            status: 200,
            timeout: 0,
            url: 'http://localhost',
        });

        fetch.setup(o => o.execute(It.IsAny(), It.IsAny())).returns(Promise.resolve(response));

        await expect(target.exchangeClientCredentialsAsync(APPKEY, PASSWORD, DeviceType.AUTOMOWER)).resolves.toStrictEqual(token);
    });

    it('should return an oauth token when logged in with gardena client credentials successfully', async () => {
        const token: OAuthToken = {
            access_token: 'access token',
            expires_in: 100,
            provider: 'provider',
            refresh_token: 'refresh token',
            scope: 'my scope',
            token_type: 'all the things',
            user_id: '12345'
        };

        const body = JSON.stringify(token);

        const response = new Response(body, {
            headers: { },
            size: 0,
            status: 200,
            timeout: 0,
            url: 'http://localhost',
        });

        fetch.setup(o => o.execute(It.IsAny(), It.IsAny())).returns(Promise.resolve(response));

        await expect(target.exchangeClientCredentialsAsync(APPKEY, PASSWORD, DeviceType.GARDENA)).resolves.toStrictEqual(token);
    });

    it('should not throw an error on successful response when logout client credentials', async () => {
        const response = new Response(undefined, {
            headers: { },
            size: 0,
            status: 200,
            timeout: 0,
            url: 'http://localhost',
        });

        fetch.setup(o => o.execute(It.IsAny(), It.IsAny())).returns(Promise.resolve(response));

        await expect(target.logoutClientCredentialsAsync({
            access_token: '12345',
            expires_in: 1,
            provider: 'hello',
            refresh_token: 'abcd1234',
            scope: 'everything',
            token_type: 'fancy',
            user_id: 'me'
        })).resolves.not.toThrowError();
    });

    it('should throw error on not authorized 401 response when logout client credentials', async () => {
        const response = new Response(undefined, {
            headers: { },
            size: 0,
            status: 401,
            timeout: 0,
            url: 'http://localhost',
        });

        fetch.setup(o => o.execute(It.IsAny(), It.IsAny())).returns(Promise.resolve(response));

        await expect(target.logoutClientCredentialsAsync({
            access_token: '12345',
            expires_in: 1,
            provider: 'hello',
            refresh_token: 'abcd1234',
            scope: 'everything',
            token_type: 'fancy',
            user_id: 'me'
        })).rejects.toThrowError();
    });

    it('should throw error on response not ok when logout client credentials', async () => {
        const response = new Response(undefined, {
            headers: { },
            size: 0,
            status: 500,
            timeout: 0,
            url: 'http://localhost',
        });

        fetch.setup(o => o.execute(It.IsAny(), It.IsAny())).returns(Promise.resolve(response));

        await expect(target.logoutClientCredentialsAsync({
            access_token: '12345',
            expires_in: 1,
            provider: 'hello',
            refresh_token: 'abcd1234',
            scope: 'everything',
            token_type: 'fancy',
            user_id: 'me'
        })).rejects.toThrowError();
    });

    it('should throw a simultaneous login error on 400 response when simultaneous login detected for client credentials', async () => {
        errorFactory.setup(o => o.simultaneousLoginError(It.IsAny(), It.IsAny())).returns(new SimultaneousLoginError('hello', '12345'));

        const error: AuthenticationErrorResponse = {
            error: 'invalid_request',
            error_code: 'simultaneous.logins',
            error_description: 'Simultaneous logins detected for client[id=REDACTED], user[id=REDACTED, email=REDACTED}]'
        };
            
        const body = JSON.stringify(error);

        const response = new Response(body, {
            headers: { },
            size: 0,
            status: 400,
            timeout: 0,
            url: 'http://localhost',
        });       

        fetch.setup(o => o.execute(It.IsAny(), It.IsAny())).returns(Promise.resolve(response));

        await expect(target.exchangeClientCredentialsAsync(APPKEY, PASSWORD, DeviceType.AUTOMOWER)).rejects.toThrowError(SimultaneousLoginError);
    });

    it('should return an oauth token when logged in with automower password successfully', async () => {
        const token: OAuthToken = {
            access_token: 'access token',
            expires_in: 100,
            provider: 'provider',
            refresh_token: 'refresh token',
            scope: 'my scope',
            token_type: 'all the things',
            user_id: '12345'
        };

        const body = JSON.stringify(token);

        const response = new Response(body, {
            headers: { },
            size: 0,
            status: 200,
            timeout: 0,
            url: 'http://localhost',
        });

        fetch.setup(o => o.execute(It.IsAny(), It.IsAny())).returns(Promise.resolve(response));

        await expect(target.exchangePasswordAsync(APPKEY, USERNAME, PASSWORD, DeviceType.AUTOMOWER)).resolves.toStrictEqual(token);
    });

    it('should return an oauth token when logged in with gardena password successfully', async () => {
        const token: OAuthToken = {
            access_token: 'access token',
            expires_in: 100,
            provider: 'provider',
            refresh_token: 'refresh token',
            scope: 'my scope',
            token_type: 'all the things',
            user_id: '12345'
        };

        const body = JSON.stringify(token);

        const response = new Response(body, {
            headers: { },
            size: 0,
            status: 200,
            timeout: 0,
            url: 'http://localhost',
        });

        fetch.setup(o => o.execute(It.IsAny(), It.IsAny())).returns(Promise.resolve(response));

        await expect(target.exchangePasswordAsync(APPKEY, USERNAME, PASSWORD, DeviceType.GARDENA)).resolves.toStrictEqual(token);
    });

    it('should logout successfully', async () => {
        const response = new Response(undefined, {
            headers: { },
            size: 0,
            status: 204,
            timeout: 0,
            url: 'http://localhost',
        });

        fetch.setup(o => o.execute(It.IsAny(), It.IsAny())).returns(Promise.resolve(response));

        await target.logoutPasswordAsync(APPKEY, {
            access_token: '12345',
            expires_in: 1,
            provider: 'hello',
            refresh_token: 'abcd1234',
            scope: 'everything',
            token_type: 'fancy',
            user_id: 'me'
        });
    });

    it('should not throw an error on 403 when logout', async () => {
        const response = new Response(undefined, {
            headers: { },
            size: 0,
            status: 403,
            timeout: 0,
            url: 'http://localhost',
        });

        fetch.setup(o => o.execute(It.IsAny(), It.IsAny())).returns(Promise.resolve(response));

        await target.logoutPasswordAsync(APPKEY, {
            access_token: '12345',
            expires_in: 1,
            provider: 'hello',
            refresh_token: 'abcd1234',
            scope: 'everything',
            token_type: 'fancy',
            user_id: 'me'
        });
    });

    it('should throw not authorized error on 401 when logout', async () => {
        errorFactory.setup(o => o.notAuthorizedError(It.IsAny(), It.IsAny()))
            .returns(new NotAuthorizedError('hello', '12345'));

        const response = new Response(undefined, {
            headers: { },
            size: 0,
            status: 401,
            timeout: 0,
            url: 'http://localhost',
        });

        fetch.setup(o => o.execute(It.IsAny(), It.IsAny())).returns(Promise.resolve(response));

        await expect(target.logoutPasswordAsync(APPKEY, {
            access_token: '12345',
            expires_in: 1,
            provider: 'hello',
            refresh_token: 'abcd1234',
            scope: 'everything',
            token_type: 'fancy',
            user_id: 'me'
        })).rejects.toThrowError(NotAuthorizedError);
    });

    it('should throw error on response not ok when logout', async () => {
        const response = new Response(undefined, {
            headers: { },
            size: 0,
            status: 500,
            timeout: 0,
            url: 'http://localhost',
        });

        fetch.setup(o => o.execute(It.IsAny(), It.IsAny())).returns(Promise.resolve(response));

        await expect(target.logoutPasswordAsync(APPKEY, {
            access_token: '12345',
            expires_in: 1,
            provider: 'hello',
            refresh_token: 'abcd1234',
            scope: 'everything',
            token_type: 'fancy',
            user_id: 'me'
        })).rejects.toThrowError();
    });

    it('should throw bad oauth token error on 400 for refresh', async () => {
        errorFactory.setup(o => o.badOAuthTokenError(It.IsAny(), It.IsAny()))
            .returns(new BadOAuthTokenError('hello', '12345'));

        const response = new Response(undefined, {
            headers: { },
            size: 0,
            status: 400,
            timeout: 0,
            url: 'http://localhost',
        });

        fetch.setup(o => o.execute(It.IsAny(), It.IsAny())).returns(Promise.resolve(response));

        await expect(target.refresh(APPKEY, {
            access_token: '12345',
            expires_in: 1,
            provider: 'hello',
            refresh_token: 'abcd1234',
            scope: 'everything',
            token_type: 'fancy',
            user_id: 'me'
        })).rejects.toThrowError(BadOAuthTokenError);
    });

    it('should throw not authorized error on 401 for refresh', async () => {
        errorFactory.setup(o => o.notAuthorizedError(It.IsAny(), It.IsAny()))
            .returns(new NotAuthorizedError('hello', '12345'));

        const response = new Response(undefined, {
            headers: { },
            size: 0,
            status: 401,
            timeout: 0,
            url: 'http://localhost',
        });

        fetch.setup(o => o.execute(It.IsAny(), It.IsAny())).returns(Promise.resolve(response));

        await expect(target.refresh(APPKEY, {
            access_token: '12345',
            expires_in: 1,
            provider: 'hello',
            refresh_token: 'abcd1234',
            scope: 'everything',
            token_type: 'fancy',
            user_id: 'me'
        })).rejects.toThrowError(NotAuthorizedError);
    });

    it('should throw error on 500 for refresh', async () => {
        const response = new Response(undefined, {
            headers: { },
            size: 0,
            status: 500,
            timeout: 0,
            url: 'http://localhost',
        });

        fetch.setup(o => o.execute(It.IsAny(), It.IsAny())).returns(Promise.resolve(response));

        await expect(target.refresh(APPKEY, {
            access_token: '12345',
            expires_in: 1,
            provider: 'hello',
            refresh_token: 'abcd1234',
            scope: 'everything',
            token_type: 'fancy',
            user_id: 'me'
        })).rejects.toThrowError();
    });

    it('should return new token on refresh', async () => {
        const newToken: OAuthToken = {
            access_token: '123456',
            expires_in: 12,
            provider: 'hello1',
            refresh_token: 'abcd12345',
            scope: 'everything1',
            token_type: 'fancy1',
            user_id: 'me1'
        };

        const body = JSON.stringify(newToken);
        const response = new Response(body, {
            headers: { },
            size: 0,
            status: 200,
            timeout: 0,
            url: 'http://localhost',
        });

        fetch.setup(o => o.execute(It.IsAny(), It.IsAny())).returns(Promise.resolve(response));

        await expect(target.refresh(APPKEY, {
            access_token: '12345',
            expires_in: 1,
            provider: 'hello',
            refresh_token: 'abcd1234',
            scope: 'everything',
            token_type: 'fancy',
            user_id: 'me'
        })).resolves.toStrictEqual(newToken);
    });
});
