import { Localization } from '../primitives/localization';
import { BadConfigurationError } from './badConfigurationError';
import { BadCredentialsError } from './badCredentialsError';

/**
 * A mechanism which creates localized error messages.
 */
export interface ErrorFactory {
    /**
     * Creates a new {@link BadConfigurationError} error.
     * @param message The message to localize.
     * @param errorCode The error code.
     * @param params Any parameters which need to be used during localization.
     */
    badConfigurationError(message: string, errorCode: string, ...params: unknown[]): BadConfigurationError;

    /**
     * Creates a new {@link BadCredentialsError} error.
     * @param message The message to localize.
     * @param errorCode The error code.
     * @param params Any parameters which need to be used during localization.
     */
    badCredentialsError(message: string, errorCode: string, ...params: unknown[]): BadCredentialsError;
}

/**
 * A default implementation of a {@link ErrorFactory} which creates errors with localized messages.
 */
export class DefaultErrorFactory implements ErrorFactory {
    public constructor(private locale: Localization) { }

    public badCredentialsError(message: string, errorCode: string, ...params: unknown[]): BadCredentialsError {
        return new BadCredentialsError(this.locale.format(message, ...params), errorCode);
    }

    public badConfigurationError(message: string, errorCode: string, ...params: unknown[]): BadConfigurationError {
        return new BadConfigurationError(this.locale.format(message, ...params), errorCode);
    }
}