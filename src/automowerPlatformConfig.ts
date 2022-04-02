import { PlatformConfig } from "homebridge";

/** 
 * Describes the platform configuration settings.
 */
 export interface AutomowerPlatformConfig extends PlatformConfig {    
    username: string;
    password: string;
    appKey: string;    
}