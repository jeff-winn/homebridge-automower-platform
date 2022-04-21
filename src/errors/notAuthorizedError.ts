/**
 * Thrown when the client is not authorized to perform an action.
 */
export class NotAuthorizedError extends Error {
    constructor(message?: string) {
        super(message);
        
        // To fix an issue with type checks on the error.
        Object.setPrototypeOf(this, NotAuthorizedError.prototype);        
    }
}