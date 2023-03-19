import { Logging } from 'homebridge';

import { Environment } from '../../primitives/environment';
import { Localization } from '../../primitives/localization';
import { ConsoleWrapper } from '../primitives/consoleWrapper';
import { DefaultLogger } from './defaultLogger';

/**
 * A logger which will force debug messages to the standard output for the console.
 */
export class ForceDebugLogger extends DefaultLogger {
    public constructor(private console: ConsoleWrapper, log: Logging, locale: Localization, env: Environment) {
        super(log, locale, env);
    }

    public override debug(message: string, ...parameters: unknown[]): void {
        this.console.stdout(this.formatMessage(message, ...parameters));
    }
}