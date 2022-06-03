import { It, Mock } from 'moq.ts';

import { AuthenticationClientImpl, OAuthToken } from '../../src/clients/authenticationClient';
import { FetchClient, Response } from '../../src/clients/fetchClient';
import { BadConfigurationError } from '../../src/errors/badConfigurationError';
import { BadCredentialsError } from '../../src/errors/badCredentialsError';
import { NotAuthorizedError } from '../../src/errors/notAuthorizedError';
import * as constants from '../../src/settings';

describe('AuthenticationClientImpl', () => {
    // These values should come from your Husqvarna account, and be placed in the .env file at the root of the workspace.
    const APPKEY: string = process.env.HUSQVARNA_APPKEY || 'APPKEY';
    const USERNAME: string = process.env.HUSQVARNA_USERNAME || 'USERNAME';
    const PASSWORD: string = process.env.HUSQVARNA_PASSWORD || 'PASSWORD';

    let fetch: Mock<FetchClient>;
    let target: AuthenticationClientImpl;

    beforeEach(async () => {
        fetch = new Mock<FetchClient>();

        target = new AuthenticationClientImpl(APPKEY, constants.AUTHENTICATION_API_BASE_URL, fetch.object());
    });

    it('should initalize correctly', () => {
        expect(target.getApplicationKey()).toBe(APPKEY);
        expect(target.getBaseUrl()).toBe(constants.AUTHENTICATION_API_BASE_URL);
    });

    it('should throw a bad credentials error on 400 response', async () => {
        const response = new Response(undefined, {
            headers: { },
            size: 0,
            status: 400,
            timeout: 0,
            url: 'http://localhost',
        });

        fetch.setup(o => o.execute(It.IsAny(), It.IsAny())).returns(Promise.resolve(response));

        await expect(target.login(USERNAME, PASSWORD)).rejects.toThrowError(BadCredentialsError);
    });

    it('should throw a not authorized error on 401 response', async () => {
        const response = new Response(undefined, {
            headers: { },
            size: 0,
            status: 401,
            timeout: 0,
            url: 'http://localhost',
        });

        fetch.setup(o => o.execute(It.IsAny(), It.IsAny())).returns(Promise.resolve(response));

        await expect(target.login(USERNAME, PASSWORD)).rejects.toThrowError(NotAuthorizedError);
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

        await expect(target.login(USERNAME, PASSWORD)).rejects.toThrowError(Error);
    });

    it('should return an oauth token when logged in successfully', async () => {
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

        await expect(target.login(USERNAME, PASSWORD)).resolves.toStrictEqual(token);
    });

    it('should throw an error when app key is undefined on login', async () => {
        target = new AuthenticationClientImpl(undefined, constants.AUTHENTICATION_API_BASE_URL, fetch.object());

        let thrown = false;

        try {
            await target.login(USERNAME, PASSWORD);
        } catch (e) {
            if (e instanceof BadConfigurationError) {
                thrown = true;
            }
        }

        expect(thrown).toBeTruthy();
    });

    it('should throw an error when app key is empty on login', async () => {
        target = new AuthenticationClientImpl('', constants.AUTHENTICATION_API_BASE_URL, fetch.object());

        let thrown = false;

        try {
            await target.login(USERNAME, PASSWORD);
        } catch (e) {
            if (e instanceof BadConfigurationError) {
                thrown = true;
            }
        }

        expect(thrown).toBeTruthy();
    });

    it('should throw an error when app key is undefined on logout', async () => {
        target = new AuthenticationClientImpl(undefined, constants.AUTHENTICATION_API_BASE_URL, fetch.object());

        let thrown = false;

        try {
            await target.logout({
                access_token: '12345',
                expires_in: 1,
                provider: 'hello',
                refresh_token: 'abcd1234',
                scope: 'everything',
                token_type: 'fancy',
                user_id: 'me'
            });
        } catch (e) {
            if (e instanceof BadConfigurationError) {
                thrown = true;
            }
        }

        expect(thrown).toBeTruthy();
    });

    it('should throw an error when app key is empty on logout', async () => {
        target = new AuthenticationClientImpl('', constants.AUTHENTICATION_API_BASE_URL, fetch.object());

        let thrown = false;

        try {
            await target.logout({
                access_token: '12345',
                expires_in: 1,
                provider: 'hello',
                refresh_token: 'abcd1234',
                scope: 'everything',
                token_type: 'fancy',
                user_id: 'me'
            });
        } catch (e) {
            if (e instanceof BadConfigurationError) {
                thrown = true;
            }
        }

        expect(thrown).toBeTruthy();
    });

    it('should throw an error when username is empty', async () => {
        let thrown = false;

        try {
            await target.login('', PASSWORD);
        } catch (e) {
            thrown = true;
        }

        expect(thrown).toBeTruthy();
    });

    it('should throw an error when password is empty', async () => {
        let thrown = false;

        try {
            await target.login(USERNAME, '');
        } catch (e) {
            thrown = true;
        }

        expect(thrown).toBeTruthy();
    });
});
