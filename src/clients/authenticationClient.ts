import { OAuthToken } from './model';

/**
 * A client used to authenticate to the Husqvarna platform.
 */
export interface AuthenticationClient {
    /**
     * Login the user.
     * @param username The username.
     * @param password The password.
     */
    login(username: string, password: string): Promise<OAuthToken>;

    /**
     * Logout the user.
     * @param token The OAuth token.
     */
    logout(token: OAuthToken): Promise<void>;

    /**
     * Refreshes the token.
     * @param token The OAuth token to refresh.
     */
    refresh(token: OAuthToken): Promise<OAuthToken>;
}