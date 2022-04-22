import { AuthenticationClientImpl, OAuthToken } from '../../src/clients/authenticationClient';
import { AutomowerEventStreamClientImpl } from '../../src/clients/automowerEventStreamClient';
import * as constants from '../../src/constants';

describe('AutomowerEventStreamClientImpl', () => {
    // These values should come from your Husqvarna account, and be placed in the .env file at the root of the workspace.
    const APPKEY: string = process.env.HUSQVARNA_APPKEY || '';
    const USERNAME: string = process.env.HUSQVARNA_USERNAME || '';
    const PASSWORD: string = process.env.HUSQVARNA_PASSWORD || '';

    let target: AutomowerEventStreamClientImpl;
    let authClient: AuthenticationClientImpl;
    let token: OAuthToken;

    beforeAll(async () => {
        target = new AutomowerEventStreamClientImpl(constants.AUTOMOWER_STREAM_API_BASE_URL);
        authClient = new AuthenticationClientImpl(APPKEY, constants.AUTHENTICATION_API_BASE_URL);

        if (USERNAME !== '' && PASSWORD !== '') {
            token = await authClient.login(USERNAME, PASSWORD);
        }
    });

    afterAll(async () => {
        if (token !== undefined) {
            await authClient.logout(token);
        }
    });

    it.skip('should open and close the stream', () => {
        target.open({
            value: token.access_token,
            provider: token.provider
        });

        target.close();
    });
});
