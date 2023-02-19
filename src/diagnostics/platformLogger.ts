import { Environment } from '../primitives/environment';
import { PLUGIN_ID } from '../settings';

/**
 * Defines the various loggers available.
 */
export enum LoggerType {
    /**
     * The default using the Homebridge provided logger.
     */
    DEFAULT = 'default',

    /**
     * A logger which imitates the Homebridge logger for expanded capabilities.
     */
    IMITATION = 'imitation',

    /**
     * A logger which forces the writing of debug message to stdout.
     */
    FORCE_DEBUG = 'force_debug'
}

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

/**
 * An abstract {@link PlatformLogger}.
 */
export abstract class AbstractPlatformLogger implements PlatformLogger {
    private isDebugEnabled?: boolean;

    protected constructor(private env: Environment) { }

    public abstract info(message: string, ...parameters: unknown[]): void;

    public abstract warn(message: string, ...parameters: unknown[]): void;

    public abstract error(message: string, ...parameters: unknown[]): void;

    public abstract debug(message: string, ...parameters: unknown[]): void;

    protected checkIsDebugEnabled(): boolean {
        if (this.isDebugEnabled !== undefined) {
            return this.isDebugEnabled;
        }

        const debug = this.env.getDebugEnvironmentVariable();
        this.isDebugEnabled = (debug === PLUGIN_ID || debug === '*');

        return this.isDebugEnabled;
    }
}