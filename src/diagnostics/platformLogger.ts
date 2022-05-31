import * as color from 'colorette';
import util from 'util';
import { LogLevel } from 'homebridge';

import { ConsoleWrapper } from './primitives/consoleWrapper';

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
    private minLevel: number;

    public constructor(level: LogLevel, private platformName: string | undefined, private console: ConsoleWrapper) {
        this.minLevel = HomebridgeImitationLogger.getLevel(level);
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
        const current = HomebridgeImitationLogger.getLevel(level);
        if (current < this.minLevel) {
            return;
        }
        
        let msg = util.format(message, ...parameters);
        let println = this.console.stdout;

        switch (level) {
        case LogLevel.DEBUG:
            msg = color.gray(msg);            
            break;

        case LogLevel.ERROR:
            msg = color.red(msg);
            println = this.console.stderr;
            break;

        case LogLevel.WARN:
            msg = color.yellow(msg);
            println = this.console.stderr;
            break;
        }

        if (this.platformName !== undefined) {
            msg = color.cyan(`[${this.platformName}] `) + msg;
        }

        msg = color.white(`[${new Date().toLocaleString()}] `) + msg;        
        println(msg);
    }

    public static getLevel(level: LogLevel): number {
        switch (level) {
        case LogLevel.DEBUG:
            return 0;

        case LogLevel.INFO:
            return 1;
        
        case LogLevel.WARN:
            return 2;

        case LogLevel.ERROR:
            return 3;

        default:
            throw new Error(`The value '${level}' is not supported.`);
        }
    }
}