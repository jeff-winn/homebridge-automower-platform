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

/**
 * Describes an OAuth authentication token.
 */
export interface OAuthToken {
    /**
     * The access token.
     */
    access_token: string;

    /**
     * The scope.
     */
    scope: string;

    /**
     * The number of seconds until the token expires.
     */
    expires_in: number;
    
    /**
     * The token to use when refreshing the token.
     */
    refresh_token: string;

    /**
     * The provider.
     */
    provider: string;

    /**
     * The user identifier.
     */
    user_id: string;

    /**
     * The token type.
     */
    token_type: string;
}