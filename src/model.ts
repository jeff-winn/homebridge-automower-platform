/**
 * Describes an access token.
 */
export interface AccessToken {
    value: string;
    provider: string;
}

/**
 * Defines the supported device types.
 */
export enum DeviceType {
    AUTOMOWER = 'automower'    
}

/**
 * Defines the supported authentication modes.
 */
export enum AuthenticationMode {
    PASSWORD = 'password',    
    CLIENT_CREDENTIALS = 'client_credentials'
}