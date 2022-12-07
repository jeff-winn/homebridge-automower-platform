import y18n from 'y18n';
import { Environment } from './environment';

/**
 * A mechanism which supports localization of string resources.
 */
export interface Localization {
    /**
     * Formats the localized string.
     * @param message The message.
     * @param args The arguments used while formatting the message.
     */
     format(message: string, ...args: unknown[]): string;
}

/**
 * A localization implementation which uses y18n to handle message translations.
 */
export class Y18nLocalization implements Localization {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    private readonly translate: any;

    public constructor(lang: string | undefined, env: Environment) {
        this.translate = y18n({
            locale: lang,
            directory: `${env.getPackageRoot()}/locales`,
            updateFiles: false // This will ensure the local file isn't trying to be modified.
        }).__;
    }

    public format(message: string, ...args: unknown[]): string {
        return this.translate(message, ...args);        
    }
}