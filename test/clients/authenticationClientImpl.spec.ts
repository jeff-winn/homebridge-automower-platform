import { OAuthToken } from '../../src/clients/authenticationClient';
import { AuthenticationClientImpl } from '../../src/clients/authenticationClientImpl'

const itIf = (condition: boolean, ...args: [ string, jest.ProvidesCallback, number ]) => 
    condition ? it(...args) : it.skip(...args);

// These values need to be provided for the test to run.
// Add the process environment variables to a .env file at the root for the values to be loaded.
const APPKEY:   string = process.env.HUSQVARNA_APPKEY   || '';
const USERNAME: string = process.env.HUSQVARNA_USERNAME || '';
const PASSWORD: string = process.env.HUSQVARNA_PASSWORD || '';
const RUN_AUTHENTICATION_TESTS: string = process.env.RUN_AUTHENTICATION_TESTS || '';
const DEFAULT_TIMEOUT: number = 5000;

function shouldRun(): boolean {
    return RUN_AUTHENTICATION_TESTS == 'true';
}

let target: AuthenticationClientImpl;
let token: OAuthToken;

beforeAll(async () => {
    target = new AuthenticationClientImpl(APPKEY, "https://api.authentication.husqvarnagroup.dev/v1");
});

itIf(shouldRun(), "should login the user as expected", async () => {
    token = await target.login(USERNAME, PASSWORD);

    expect(token).toBeDefined();
    expect(token.access_token).toBeDefined();
    expect(token.scope).toBeDefined();
    expect(token.expires_in).toBeGreaterThan(0);
    expect(token.refresh_token).toBeDefined();
    expect(token.provider).toBe("husqvarna");
    expect(token.user_id).toBeDefined();
    expect(token.token_type).toBe("Bearer");
}, DEFAULT_TIMEOUT);

itIf(shouldRun(), "should login and logout the user as expected", async () => {    
    token = await target.login(USERNAME, PASSWORD);

    expect(token).toBeDefined();

    await target.logout(token);
}, DEFAULT_TIMEOUT);

itIf(shouldRun(), "should allow the token to be refreshed", async () => {    
    token = await target.login(USERNAME, PASSWORD);

    expect(token).toBeDefined();

    let newToken = await target.refresh(token);
    
    expect(newToken).toBeDefined();
    expect(newToken.access_token).not.toBe(token.access_token);
    expect(newToken.scope).toBeDefined();
    expect(newToken.expires_in).toBeGreaterThan(0);
    expect(newToken.refresh_token).not.toBe(token.refresh_token);
    expect(newToken.provider).toBe("husqvarna");
    expect(newToken.user_id).toBeDefined();
    expect(newToken.token_type).toBe("Bearer");
}, DEFAULT_TIMEOUT);