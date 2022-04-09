import { AuthenticationClientImpl } from '../../../src/clients/impl/authenticationClientImpl';

describe('authentication client', () => {
    /* These values should come from your Husqvarna account, and be placed in the .env file at the root of the workspace. */
    const APPKEY: string = process.env.HUSQVARNA_APPKEY || '';
    const USERNAME: string = process.env.HUSQVARNA_USERNAME || '';
    const PASSWORD: string = process.env.HUSQVARNA_PASSWORD || '';
    const BASE_URL = 'https://api.authentication.husqvarnagroup.dev/v1';

    let target: AuthenticationClientImpl;

    beforeAll(async () => {
        target = new AuthenticationClientImpl(APPKEY, BASE_URL);
    });

    it('should initalize correctly', () => {
        expect(target.getApplicationKey()).toBe(APPKEY);
        expect(target.getBaseUrl()).toBe(BASE_URL);
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