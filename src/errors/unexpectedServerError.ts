/**
 * Thrown when an unexpected error occurs within the Husqvarna servers.
 */
 export class UnexpectedServerError extends Error {
    public constructor(message?: string | undefined) {
        super(message);

        // To fix an issue when checking the type of an error.
        Object.setPrototypeOf(this, UnexpectedServerError.prototype);
    }
}