import { AutomowerPlatform } from '../automowerPlatform';

/**
 * A mechanism to register any automowers associated with an account.
 */
export interface RegistrationService {
    /**
     * Registers the mowers with the platform.
     * @param platform The platform to which the accessories should be registered.
     */
    registerMowers(platform: AutomowerPlatform): Promise<void>;
}