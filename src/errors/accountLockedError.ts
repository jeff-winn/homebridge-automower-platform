import { BadCredentialsError } from './badCredentialsError';

/**
 * Thrown when bad credentials are used while trying to authenticate.
 */
export class AccountLockedError extends BadCredentialsError {
    public constructor(message: string, errorCode: string) {
        super(message, errorCode);

        // To fix an issue when checking the type of an error.
        Object.setPrototypeOf(this, AccountLockedError.prototype);
    }
}