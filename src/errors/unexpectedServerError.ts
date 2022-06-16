import { PlatformError } from './platformError';

/**
 * Thrown when an unexpected error occurs within the Husqvarna servers.
 */
export class UnexpectedServerError extends PlatformError {
    public constructor(message: string, errorCode: string) {
        super(message, errorCode);

        // To fix an issue when checking the type of an error.
        Object.setPrototypeOf(this, UnexpectedServerError.prototype);
    }
}