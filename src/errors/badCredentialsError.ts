import { BadConfigurationError } from './badConfigurationError';

/**
 * Thrown when bad credentials are used while trying to authenticate.
 */
export class BadCredentialsError extends BadConfigurationError {
    public constructor(message?: string | undefined) {
        super(message);

        // To fix an issue when checking the type of an error.
        Object.setPrototypeOf(this, BadCredentialsError.prototype);
    }
}