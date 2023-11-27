import { AutomowerClient } from '../../../clients/automower/automowerClient';
import { NotAuthorizedError } from '../../../errors/notAuthorizedError';
import { AccessTokenManager } from '../accessTokenManager';

/**
 * A mechanism to change configuration settings for a mower.
 */
export interface ChangeSettingsService {
    /**
     * Changes the cutting height.
     * @param mowerId The mower id.
     * @param newValue The new cutting height value.
     */
    changeCuttingHeightAsync(mowerId: string, newValue: number): Promise<void>;
}

export class ChangeSettingsServiceImpl implements ChangeSettingsService {
    public constructor(private tokenManager: AccessTokenManager, private client: AutomowerClient) { }
    
    public async changeCuttingHeightAsync(mowerId: string, newValue: number): Promise<void> {
        try {
            const token = await this.tokenManager.getCurrentTokenAsync();

            return await this.client.changeSettings(mowerId, {
                cuttingHeight: newValue
            }, token);            
        } catch (e) {
            if (e instanceof NotAuthorizedError) {
                this.tokenManager.flagAsInvalid();
            }

            throw (e);
        }
    }
}