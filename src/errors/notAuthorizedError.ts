import { PlatformError } from './platformError';

/**
 * Thrown when the client is not authorized to perform an action.
 */
export class NotAuthorizedError extends PlatformError {
    public constructor(message: string, errorCode: string) {
        super(message, errorCode);
        
        // To fix an issue with type checks on the error.
        Object.setPrototypeOf(this, NotAuthorizedError.prototype);        
    }
}