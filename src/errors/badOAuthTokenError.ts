import { BadCredentialsError } from './badCredentialsError';

/**
 * Thrown when a bad OAuth token is being used while trying to authenticate.
 */
export class BadOAuthTokenError extends BadCredentialsError {
    public constructor(message: string, errorCode: string) {
        super(message, errorCode);

        // To fix an issue when checking the type of an error.
        Object.setPrototypeOf(this, BadOAuthTokenError.prototype);
    }
}