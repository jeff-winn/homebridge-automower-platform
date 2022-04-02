import { OAuthToken } from '../../../src/clients/authenticationClient';
import { AuthenticationClientImpl } from '../../../src/clients/impl/authenticationClientImpl';
import { AutomowerClientImpl } from '../../../src/clients/impl/automowerClientImpl'

describe("automower client", () => {
    /* These values should come from your Husqvarna account, and be placed in the .env file at the root of the workspace. */
    const APPKEY:   string = process.env.HUSQVARNA_APPKEY   || '';
    const USERNAME: string = process.env.HUSQVARNA_USERNAME || '';
    const PASSWORD: string = process.env.HUSQVARNA_PASSWORD || '';
    const BASE_AUTHENTICATION_URL: string = "https://api.authentication.husqvarnagroup.dev/v1";
    const BASE_URL: string = "https://api.amc.husqvarna.dev/v1";

    let authenticationClient: AuthenticationClientImpl;
    let token: OAuthToken;

    let target: AutomowerClientImpl;

    beforeAll(async () => {
        target = new AutomowerClientImpl(APPKEY, BASE_URL);

        authenticationClient = new AuthenticationClientImpl(APPKEY, BASE_AUTHENTICATION_URL);
        token = await authenticationClient.login(USERNAME, PASSWORD);
    });

    afterAll(async () => {
        if (token !== undefined) await authenticationClient.logout(token);
    });

    it("should get all the mowers from the account", async () => {
        let mowers = await target.getMowers(token);

        expect(mowers).toBeDefined();
    });
});