import { AuthenticationClientImpl } from '../../../src/clients/impl/authenticationClientImpl';
import { AutomowerClientImpl } from '../../../src/clients/impl/automowerClientImpl';
import { OAuthToken } from '../../../src/clients/model';
import * as constants from '../../../src/constants';

describe('automower client', () => {
    /* These values should come from your Husqvarna account, and be placed in the .env file at the root of the workspace. */
    const APPKEY: string = process.env.HUSQVARNA_APPKEY || '';
    const USERNAME: string = process.env.HUSQVARNA_USERNAME || '';
    const PASSWORD: string = process.env.HUSQVARNA_PASSWORD || '';
    const MOWER_ID: string = process.env.MOWER_ID || '';

    let authenticationClient: AuthenticationClientImpl;
    let target: AutomowerClientImpl;
    let token: OAuthToken;

    beforeAll(async () => {
        target = new AutomowerClientImpl(APPKEY, constants.AUTOMOWER_CONNECT_API_BASE_URL);
        authenticationClient = new AuthenticationClientImpl(APPKEY, constants.AUTHENTICATION_API_BASE_URL);

        if (USERNAME !== '' && PASSWORD !== '') {
            token = await authenticationClient.login(USERNAME, PASSWORD);
        }        
    });

    afterAll(async () => {
        if (token !== undefined) {
            await authenticationClient.logout(token);
        }
    });

    it('should initialize correctly', () => {
        expect(target.getApplicationKey()).toBe(APPKEY);
        expect(target.getBaseUrl()).toBe(constants.AUTOMOWER_CONNECT_API_BASE_URL);
    });

    it('should throw an error when the mower id is empty on doAction', async () => {
        let thrown = false;

        try {
            await target.doAction('', { }, token);
        } catch (e) {
            thrown = true;
        }

        expect(thrown).toBeTruthy();
    });

    it('should throw an error when the mower id is empty on getMower', async () => {
        let thrown = false;

        try {
            await target.getMower('', token);
        } catch (e) {
            thrown = true;
        }

        expect(thrown).toBeTruthy();
    });

    it.skip('should pause the mower', async () => {
        await target.doAction(MOWER_ID, {
            type: 'Pause'
        }, token);
    });

    it.skip('should get all the mowers from the account', async () => {
        const mowers = await target.getMowers(token);

        expect(mowers).toBeDefined();
    });

    it.skip('should return undefined when the mower does not exist by id', async () => {
        const mower = await target.getMower('000000', token);
    
        expect(mower).toBeUndefined();
    });

    it.skip('should get a specific mower by the id', async () => {
        const mower = await target.getMower(MOWER_ID, token);
    
        expect(mower).toBeDefined();
    });
});