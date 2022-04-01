import { AuthenticationClientImpl } from './authenticationClientImpl'

let target: AuthenticationClientImpl;

// These values need to be provided for the test to pass.
let appKey: string = "";
let username: string = "";
let password: string = "";

beforeEach(() => {
    target = new AuthenticationClientImpl(appKey, "https://api.authentication.husqvarnagroup.dev/v1");
});

it("should login the user as expected", async () => {
    let token = await target.login(username, password);

    expect(token).toBeDefined();
    expect(token.access_token).toBeDefined();
    expect(token.scope).toBeDefined();
    expect(token.expires_in).toBeGreaterThan(0);
    expect(token.refresh_token).toBeDefined();
    expect(token.provider).toBe("husqvarna");
    expect(token.user_id).toBeDefined();
    expect(token.token_type).toBe("Bearer");
});

it("should login and logout the user as expected", async () => {
    let token = await target.login(username, password);

    expect(token).toBeDefined();

    await target.logout(token);
});

it("should allow the token to be refreshed", async () => {
    let token = await target.login(username, password);

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
});