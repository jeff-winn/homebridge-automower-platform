import { AuthenticationClientImpl } from '../../../src/clients/impl/authenticationClientImpl';
import { AutomowerClientImpl } from '../../../src/clients/impl/automowerClientImpl';

describe('automower client', () => {
    /* These values should come from your Husqvarna account, and be placed in the .env file at the root of the workspace. */
    const APPKEY: string = process.env.HUSQVARNA_APPKEY || '';
    const USERNAME: string = process.env.HUSQVARNA_USERNAME || '';
    const PASSWORD: string = process.env.HUSQVARNA_PASSWORD || '';
    const MOWER_ID: string = process.env.MOWER_ID || '';

    const BASE_AUTHENTICATION_URL = 'https://api.authentication.husqvarnagroup.dev/v1';
    const BASE_URL = 'https://api.amc.husqvarna.dev/v1';

    let authenticationClient: AuthenticationClientImpl;
    let target: AutomowerClientImpl;

    beforeAll(async () => {
        target = new AutomowerClientImpl(APPKEY, BASE_URL);
        authenticationClient = new AuthenticationClientImpl(APPKEY, BASE_AUTHENTICATION_URL);
    });

    it('should initialize correctly', () => {
        expect(target.getApplicationKey()).toBe(APPKEY);
        expect(target.getBaseUrl()).toBe(BASE_URL);
    });

    it.skip('should pause the mower', async () => {
        const token = await authenticationClient.login(USERNAME, PASSWORD);

        try {
            await target.doAction(MOWER_ID, {
                type: 'Pause'
            }, token);
        } finally {
            await authenticationClient.logout(token);
        }
    });

    it.skip('should get all the mowers from the account', async () => {
        const token = await authenticationClient.login(USERNAME, PASSWORD);

        try {
            const mowers = await target.getMowers(token);

            expect(mowers).toBeDefined();
        } finally {
            await authenticationClient.logout(token);
        }        
    });

    it.skip('should return undefined when the mower does not exist by id', async () => {
        const token = await authenticationClient.login(USERNAME, PASSWORD);

        try {
            const mower = await target.getMower('000000', token);
        
            expect(mower).toBeUndefined();
        } finally {
            await authenticationClient.logout(token);
        }
    });

    it.skip('should get a specific mower by the id', async () => {
        const token = await authenticationClient.login(USERNAME, PASSWORD);

        try {
            const mower = await target.getMower(MOWER_ID, token);
        
            expect(mower).toBeDefined();
        } finally {
            await authenticationClient.logout(token);
        }
    });
});