import chalk, { Chalk } from 'chalk';
import util from 'util';
import { LogLevel } from 'homebridge';

import { ConsoleWrapper } from './primitives/consoleWrapper';
import { Environment } from '../primitives/environment';
import { PLUGIN_ID } from '../settings';

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
 * A logger which imitates the native logging that occurs by the Homebridge platform {@link Logging} interface.
 */
export class HomebridgeImitationLogger implements PlatformLogger {
    private isDebugEnabled?: boolean;
    private color: Chalk;

    public constructor(private env: Environment, private platformName: string | undefined, private console: ConsoleWrapper) { 
        this.color = new chalk.Instance({ level: 1 });
    }

    public info(message: string, ...parameters: unknown[]): void {
        this.log(LogLevel.INFO, message, ...parameters);
    }

    public warn(message: string, ...parameters: unknown[]): void {
        this.log(LogLevel.WARN, message, ...parameters);
    }

    public error(message: string, ...parameters: unknown[]): void {
        this.log(LogLevel.ERROR, message, ...parameters);
    }

    public debug(message: string, ...parameters: unknown[]): void {
        this.log(LogLevel.DEBUG, message, ...parameters);
    }

    private log(level: LogLevel, message: string, ...parameters: unknown[]): void {
        if (level === LogLevel.DEBUG && !this.checkIsDebugEnabled()) {
            // Debug logging is not currently enabled, just ignore the message.
            return;
        }
        
        let msg = util.format(message, ...parameters);
        let println = this.console.stdout;

        switch (level) {
        case LogLevel.DEBUG:
            msg = this.color.gray(msg);            
            break;

        case LogLevel.ERROR:
            msg = this.color.red(msg);
            println = this.console.stderr;
            break;

        case LogLevel.WARN:
            msg = this.color.yellow(msg);
            println = this.console.stderr;
            break;
        }

        if (this.platformName !== undefined) {
            msg = this.color.cyan(`[${this.platformName}] `) + msg;
        }
    
        msg = this.color.white(`[${new Date().toLocaleString()}] `) + msg;        
        println(msg);
    }

    private checkIsDebugEnabled(): boolean {
        if (this.isDebugEnabled !== undefined) {
            return this.isDebugEnabled;
        }

        const debug = this.env.getDebugEnvironmentVariable();
        this.isDebugEnabled = (debug === PLUGIN_ID || debug === '*');

        return this.isDebugEnabled;
    }
}
