import { PlatformError } from './platformError';

/**
 * Thrown when the user is missing settings within their configuration.
 */
export class BadConfigurationError extends PlatformError {
    public constructor(message: string, errorCode: string) {
        super(message, errorCode);

        // To fix an issue when checking the type of an error.
        Object.setPrototypeOf(this, BadConfigurationError.prototype);
    }
}