import { AutomowerClient } from '../../../clients/automower/automowerClient';
import { NotAuthorizedError } from '../../../errors/notAuthorizedError';
import { AccessTokenManager } from '../accessTokenManager';
import { MowerControlService } from '../mowerControlService';

/**
 * Describes an action.
 */
export interface Action {
    /**
     * The type of action.
     */
    type: string;
}

export class MowerControlServiceImpl implements MowerControlService {
    public constructor(private tokenManager: AccessTokenManager, private client: AutomowerClient) { }

    public async pause(mowerId: string): Promise<void> {
        try {
            const action: Action = {
                type: 'Pause'
            };

            const token = await this.tokenManager.getCurrentToken();
            return await this.client.doAction(mowerId, action, token);
        } catch (e) {
            if (e instanceof NotAuthorizedError) {
                this.tokenManager.flagAsInvalid();
            }

            throw (e);
        }
    }

    public async resumeSchedule(mowerId: string): Promise<void> {
        try {
            const action: Action = {
                type: 'ResumeSchedule'
            };

            const token = await this.tokenManager.getCurrentToken();
            return await this.client.doAction(mowerId, action, token);
        } catch (e) {
            if (e instanceof NotAuthorizedError) {
                this.tokenManager.flagAsInvalid();
            }

            throw (e);
        }
    }

    public async parkUntilFurtherNotice(mowerId: string): Promise<void> {
        try {
            const action: Action = {
                type: 'ParkUntilFurtherNotice'
            };

            const token = await this.tokenManager.getCurrentToken();
            return await this.client.doAction(mowerId, action, token);
        } catch (e) {
            if (e instanceof NotAuthorizedError) {
                this.tokenManager.flagAsInvalid();
            }

            throw (e);
        }
    }
}