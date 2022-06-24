import { AuthenticationClientImpl } from './clients/authenticationClient';

/**
 * The name of the platform (which must match the config.schema.json pluginAlias field).
 */
export const PLATFORM_NAME = 'Homebridge Automower Platform';

/**
  * The identifier of the plugin (which must match the package.json package name).
  */
export const PLUGIN_ID = 'homebridge-automower-platform';
 
/**
  * The base url for the authentication api.
  */
export const AUTHENTICATION_API_BASE_URL = 'https://api.authentication.husqvarnagroup.dev/v1';
 
/**
  * The base url for the Automower Connect api.
  */
export const AUTOMOWER_CONNECT_API_BASE_URL = 'https://api.amc.husqvarna.dev/v1';

/**
 * The base url for the Automower event streaming api.
 */
export const AUTOMOWER_STREAM_API_BASE_URL = 'wss://ws.openapi.husqvarna.dev/v1';