import { Mock } from 'moq.ts';

import { AuthenticationClientImpl } from '../../src/clients/authenticationClient';
import { FetchClient } from '../../src/clients/fetchClient';
import { BadConfigurationError } from '../../src/errors/badConfigurationError';
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
