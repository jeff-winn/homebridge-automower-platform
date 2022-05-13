/**
 * Thrown when bad credentials are used while trying to authenticate.
 */
export class BadCredentialsError extends Error {
    public constructor(message?: string | undefined) {
        super(message);

        // To fix an issue when checking the type of an error.
        Object.setPrototypeOf(this, BadCredentialsError.prototype);
    }
}