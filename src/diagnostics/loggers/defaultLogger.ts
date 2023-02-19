import { Logging } from 'homebridge';
import { Environment } from '../../primitives/environment';
import { Localization } from '../../primitives/localization';
import { AbstractPlatformLogger } from '../platformLogger';

/**
 * A {@link PlatformLogger} implementation which adapts the default logger provided by Homebridge to support localization.
 */
export class DefaultLogger extends AbstractPlatformLogger {
    public constructor(private log: Logging, private locale: Localization, env: Environment) { 
        super(env);
    }

    public override info(message: string, ...parameters: unknown[]): void {        
        this.log.info(this.formatMessage(message, ...parameters));
    }

    public override warn(message: string, ...parameters: unknown[]): void {
        this.log.warn(this.formatMessage(message, ...parameters));
    }

    public override error(message: string, ...parameters: unknown[]): void {
        this.log.error(this.formatMessage(message, ...parameters));
    }

    public override debug(message: string, ...parameters: unknown[]): void {
        this.log.debug(this.formatMessage(message, ...parameters));
    }
    
    protected formatMessage(message: string, ...parameters: unknown[]): string {
        return this.locale.format(message, ...parameters);
    }
}