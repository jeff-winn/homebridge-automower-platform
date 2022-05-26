/**
 * Thrown when the client is not authorized to perform an action.
 */
export class InvalidStateError extends Error {
    public constructor(message?: string) {
        super(message);
        
        // To fix an issue with type checks on the error.
        Object.setPrototypeOf(this, InvalidStateError.prototype);        
    }
}