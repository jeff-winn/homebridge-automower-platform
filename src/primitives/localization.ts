/* eslint-disable @typescript-eslint/no-explicit-any */
import y18n from 'y18n';

/**
 * A mechanism which supports localization of string resources.
 */
export interface Localization {
    /**
     * Formats the localized string.
     * @param message The message.
     * @param args The arguments used while formatting the message.
     */
     format(message: string, ...args: any[]): string;
}

/**
 * A localization implementation which uses y18n to handle message translations.
 */
export class Y18nLocalization implements Localization {
    private readonly translate: any;

    public constructor(lang: string | undefined) {
        this.translate = y18n({
            locale: lang,
            updateFiles: false // This will ensure the local file isn't trying to be modified.
        }).__;
    }

    public format(message: string, ...args: any[]): string {
        return this.translate(message, ...args);        
    }
}