import { Localization } from '../primitives/localization';
import { AccountLockedError } from './accountLockedError';
import { BadConfigurationError } from './badConfigurationError';
import { BadCredentialsError } from './badCredentialsError';
import { BadOAuthTokenError } from './badOAuthTokenError';
import { NotAuthorizedError } from './notAuthorizedError';
import { SimultaneousLoginError } from './simultaneousLoginError';
import { UnexpectedServerError } from './unexpectedServerError';

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
     * Creates a new {@link AccountLockedError} error.
     * @param message The message to localize.
     * @param errorCode The error code.
     * @param params Any parameters which need to be used during localization.
     */
    accountLockedError(message: string, errorCode: string, ...params: unknown[]): AccountLockedError;

    /**
     * Creates a new {@link BadCredentialsError} error.
     * @param message The message to localize.
     * @param errorCode The error code.
     * @param params Any parameters which need to be used during localization.
     */
    badCredentialsError(message: string, errorCode: string, ...params: unknown[]): BadCredentialsError;
    
    /**
     * Creates a new {@link BadOAuthTokenError} error.
     * @param message The message to localize.
     * @param errorCode The error code.
     * @param params Any parameters which need to be used during localization.
     */
    badOAuthTokenError(message: string, errorCode: string, ...params: unknown[]): BadOAuthTokenError;

    /**
     * Creates a new {@link NotAuthorizedError} error.
     * @param message The message to localize.
     * @param errorCode The error code.
     * @param params Any parameters which need to be used during localization.
     */
    notAuthorizedError(message: string, errorCode: string, ...params: unknown[]): NotAuthorizedError;

    /**
     * Creates a new {@link SimultaneousLoginError} error.
     * @param message The message to localize.
     * @param errorCode The error code.
     * @param params Any parameters which need to be used during localization.
     */
    simultaneousLoginError(message: string, errorCode: string, ...params: unknown[]): SimultaneousLoginError;

    /**
     * Creates a new {@link UnexpectedServerError} error.
     * @param message The message to localize.
     * @param errorCode The error code.
     * @param params Any parameters which need to be used during localization.
     */
    unexpectedServerError(message: string, errorCode: string, ...params: unknown[]): UnexpectedServerError;
}

/**
 * A default implementation of a {@link ErrorFactory} which creates errors with localized messages.
 */
export class DefaultErrorFactory implements ErrorFactory {
    public constructor(private locale: Localization) { }

    public accountLockedError(message: string, errorCode: string, ...params: unknown[]): AccountLockedError {
        return new AccountLockedError(this.locale.format(message, ...params), errorCode);
    }

    public badCredentialsError(message: string, errorCode: string, ...params: unknown[]): BadCredentialsError {
        return new BadCredentialsError(this.locale.format(message, ...params), errorCode);
    }

    public badConfigurationError(message: string, errorCode: string, ...params: unknown[]): BadConfigurationError {
        return new BadConfigurationError(this.locale.format(message, ...params), errorCode);
    }

    public badOAuthTokenError(message: string, errorCode: string, ...params: unknown[]): BadOAuthTokenError {
        return new BadOAuthTokenError(this.locale.format(message, ...params), errorCode);
    }

    public notAuthorizedError(message: string, errorCode: string, ...params: unknown[]): NotAuthorizedError {
        return new NotAuthorizedError(this.locale.format(message, ...params), errorCode);
    }

    public simultaneousLoginError(message: string, errorCode: string, ...params: unknown[]): SimultaneousLoginError {
        return new SimultaneousLoginError(this.locale.format(message, ...params), errorCode);
    }

    public unexpectedServerError(message: string, errorCode: string, ...params: unknown[]): UnexpectedServerError {
        return new UnexpectedServerError(this.locale.format(message, ...params), errorCode);
    }
}