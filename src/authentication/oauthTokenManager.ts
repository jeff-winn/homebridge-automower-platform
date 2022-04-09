import { OAuthToken } from '../clients/authenticationClient';

/**
 * A mechanism which manages the retrieval and renewal of an OAuth token.
 */
export interface OAuthTokenManager {
    /**
     * Gets the current token.
     */
    getCurrentToken(): Promise<OAuthToken>;

    /**
     * Flags the token as invalid, which will cause the next attempt to get a new token.
     */
    flagAsInvalid(): void;
}