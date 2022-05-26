/**
 * Thrown when the user is missing settings within their configuration.
 */
export class BadConfigurationError extends Error {
    public constructor(message?: string | undefined) {
        super(message);

        // To fix an issue when checking the type of an error.
        Object.setPrototypeOf(this, BadConfigurationError.prototype);
    }
}