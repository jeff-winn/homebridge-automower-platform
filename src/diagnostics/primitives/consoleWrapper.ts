/* eslint-disable no-console */

/**
 * A wrapper around the console.
 */
export interface ConsoleWrapper {
    /**
     * Writes a message to stdout.
     * @param message The message.
     */
    stdout(message: string): void;

    /**
     * Writes a message to stderr.
     * @param message The message.
     */
    stderr(message: string): void;
}

export class ConsoleWrapperImpl implements ConsoleWrapper {
    public stdout(message: string): void {
        console.log(message);
    }
    
    public stderr(message: string): void {
        console.error(message);
    }
}