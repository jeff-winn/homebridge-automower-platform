import { Logging } from 'homebridge';
import { Localization } from '../../primitives/localization';
import { PlatformLogger } from '../platformLogger';

/**
 * A {@link PlatformLogger} implementation which adapts the default logger provided by Homebridge to support localization.
 */
export class DefaultLogger implements PlatformLogger {
    public constructor(private log: Logging, private locale: Localization) { }

    public info(message: string, ...parameters: unknown[]): void {        
        this.log.info(this.formatMessage(message, ...parameters));
    }

    public warn(message: string, ...parameters: unknown[]): void {
        this.log.warn(this.formatMessage(message, ...parameters));
    }

    public error(message: string, ...parameters: unknown[]): void {
        this.log.error(this.formatMessage(message, ...parameters));
    }

    public debug(message: string, ...parameters: unknown[]): void {
        this.log.debug(this.formatMessage(message, ...parameters));
    }
    
    private formatMessage(message: string, ...parameters: unknown[]): string {
        return this.locale.format(message, ...parameters);
    }
}