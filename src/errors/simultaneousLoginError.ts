import { BadCredentialsError } from './badCredentialsError';

/**
 * Thrown when simultaneous logins are detected.
 */
export class SimultaneousLoginError extends BadCredentialsError {
    public constructor(message: string, errorCode: string) {
        super(message, errorCode);

        // To fix an issue when checking the type of an error.
        Object.setPrototypeOf(this, SimultaneousLoginError.prototype);
    }
}