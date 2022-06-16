/**
 * Thrown when an error occurs within the platform.
 */
export class PlatformError extends Error {
    public constructor(message: string, public readonly errorCode: string) {
        super(message);

        // To fix an issue when checking the type of an error.
        Object.setPrototypeOf(this, PlatformError.prototype);
    }
}