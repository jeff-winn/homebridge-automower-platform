import chalk, { Chalk } from 'chalk';
import { LogLevel } from 'homebridge';

import { ConsoleWrapper } from '../../primitives/consoleWrapper';
import { Environment } from '../../primitives/environment';
import { Localization } from '../../primitives/localization';
import { PLUGIN_ID } from '../../settings';
import { PlatformLogger } from '../platformLogger';

/**
 * A {@link PlatformLogger} implementation which imitates the native logging that occurs by the Homebridge platform {@link Logging} interface.
 */
export class HomebridgeImitationLogger implements PlatformLogger {
    private isDebugEnabled?: boolean;
    private color: Chalk;

    public constructor(private env: Environment, private platformName: string | undefined, 
        private name: string | undefined, private console: ConsoleWrapper, private locale: Localization) {

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

        let msg = this.locale.format(message, ...parameters);
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
            let logName = this.platformName;
            if (this.name !== undefined && this.name !== this.platformName) {
                // Change out the name of the platform to something to help the user identify which specific instance.
                logName = this.name;
            }            

            msg = this.color.cyan(`[${logName}] `) + msg;
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
