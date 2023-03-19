import chalk, { Chalk } from 'chalk';
import { LogLevel } from 'homebridge';

import { Environment } from '../../primitives/environment';
import { Localization } from '../../primitives/localization';
import { AbstractPlatformLogger } from '../platformLogger';
import { ConsoleWrapper } from '../primitives/consoleWrapper';

/**
 * A {@link PlatformLogger} implementation which imitates the native logging that occurs by the Homebridge platform {@link Logging} interface.
 */
export class HomebridgeImitationLogger extends AbstractPlatformLogger {
    private color: Chalk;

    public constructor(env: Environment, private platformName: string | undefined, private name: string | undefined, 
        private console: ConsoleWrapper, private locale: Localization) {
        super(env);

        this.color = new chalk.Instance({ level: 1 });
    }

    public override info(message: string, ...parameters: unknown[]): void {
        this.log(LogLevel.INFO, message, ...parameters);
    }

    public override warn(message: string, ...parameters: unknown[]): void {
        this.log(LogLevel.WARN, message, ...parameters);
    }

    public override error(message: string, ...parameters: unknown[]): void {
        this.log(LogLevel.ERROR, message, ...parameters);
    }

    public override debug(message: string, ...parameters: unknown[]): void {
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
}