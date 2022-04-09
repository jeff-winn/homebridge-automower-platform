import { BadCredentialsError } from '../../../src/clients/badCredentialsError';
import { AuthenticationClientImpl } from '../../../src/clients/impl/authenticationClientImpl';
import * as constants from '../../../src/constants';

describe('authentication client', () => {
    /* These values should come from your Husqvarna account, and be placed in the .env file at the root of the workspace. */
    const APPKEY: string = process.env.HUSQVARNA_APPKEY || '';
    const USERNAME: string = process.env.HUSQVARNA_USERNAME || '';
    const PASSWORD: string = process.env.HUSQVARNA_PASSWORD || '';

    let target: AuthenticationClientImpl;

    beforeAll(async () => {
        target = new AuthenticationClientImpl(APPKEY, constants.AUTHENTICATION_API_BASE_URL);
    });

    it('should initalize correctly', () => {
        expect(target.getApplicationKey()).toBe(APPKEY);
        expect(target.getBaseUrl()).toBe(constants.AUTHENTICATION_API_BASE_URL);
    });

    it('should throw an error when username is empty', async () => {
        let thrown = false;

        try {
            await target.login('', 'password');
        } catch (e) {
            thrown = true;
        }

        expect(thrown).toBeTruthy();
    });

    it('should throw an error when password is empty', async () => {
        let thrown = false;

        try {
            await target.login('username', '');
        } catch (e) {
            thrown = true;
        }

        expect(thrown).toBeTruthy();
    });
    
    it.skip('should not login when the credentials are invalid', async () => {
        let thrown = false;
        try {
            await target.login('this-is-not-a-username', 'nor-is-this-a-password');
        } catch (e) {
            if (e instanceof BadCredentialsError) {
                thrown = true;
            }
        }

        expect(thrown).toBeTruthy();
    });

    it.skip('integration test the entire client', async () => {
        const token = await target.login(USERNAME, PASSWORD);

        expect(token).toBeDefined();
        expect(token.access_token).toBeDefined();
        expect(token.scope).toBeDefined();
        expect(token.expires_in).toBeGreaterThan(0);
        expect(token.refresh_token).toBeDefined();
        expect(token.provider).toBe('husqvarna');
        expect(token.user_id).toBeDefined();
        expect(token.token_type).toBe('Bearer');

        const newToken = await target.refresh(token);

        expect(newToken).toBeDefined();
        expect(newToken.access_token).not.toBe(token.access_token);
        expect(newToken.scope).toBeDefined();
        expect(newToken.expires_in).toBeGreaterThan(0);
        expect(newToken.refresh_token).not.toBe(token.refresh_token);
        expect(newToken.provider).toBe('husqvarna');
        expect(newToken.user_id).toBeDefined();
        expect(newToken.token_type).toBe('Bearer');

        await target.logout(newToken);
    });    
});