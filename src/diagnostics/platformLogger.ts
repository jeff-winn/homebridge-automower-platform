/**
 * A logger which handles logging events that occur within the platform accessories.
 */
export interface PlatformLogger {
    /**
     * Writes a message.
     * @param message The message.
     * @param parameters Any parameters used to format the message.
     */
    info(message: string, ...parameters: unknown[]): void;

    /**
     * Writes a warning.
     * @param message The message.
     * @param parameters Any parameters used to format the message.
     */
    warn(message: string, ...parameters: unknown[]): void;
    
    /**
     * Writes an error.
     * @param message The message.
     * @param parameters Any parameters used to format the message.
     */
     error(message: string, ...parameters: unknown[]): void;

    /**
     * Writes a dianostic message.
     * @param message The message.
     * @param parameters Any parameters used to format the message.
     */
     debug(message: string, ...parameters: unknown[]): void;
}