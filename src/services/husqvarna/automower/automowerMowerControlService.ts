import { AutomowerClient } from '../../../clients/automower/automowerClient';
import { NotAuthorizedError } from '../../../errors/notAuthorizedError';
import { AccessTokenManager } from '../accessTokenManager';
import { MowerControlService, SupportsPauseControl } from '../mowerControlService';

/**
 * Describes an action.
 */
export interface Action {
    /**
     * The type of action.
     */
    type: string;
}

export class AutomowerMowerControlService implements MowerControlService, SupportsPauseControl {
    public constructor(private readonly tokenManager: AccessTokenManager, private readonly client: AutomowerClient) { }

    public async pause(mowerId: string): Promise<void> {
        try {
            const action: Action = {
                type: 'Pause'
            };

            const token = await this.tokenManager.getCurrentTokenAsync();
            return await this.client.doAction(mowerId, action, token);
        } catch (e) {
            if (e instanceof NotAuthorizedError) {
                this.tokenManager.flagAsInvalid();
            }

            throw (e);
        }
    }

    public async resumeAsync(mowerId: string): Promise<void> {
        try {
            const action: Action = {
                type: 'ResumeSchedule'
            };

            const token = await this.tokenManager.getCurrentTokenAsync();
            return await this.client.doAction(mowerId, action, token);
        } catch (e) {
            if (e instanceof NotAuthorizedError) {
                this.tokenManager.flagAsInvalid();
            }

            throw (e);
        }
    }

    public async parkUntilFurtherNoticeAsync(mowerId: string): Promise<void> {
        try {
            const action: Action = {
                type: 'ParkUntilFurtherNotice'
            };

            const token = await this.tokenManager.getCurrentTokenAsync();
            return await this.client.doAction(mowerId, action, token);
        } catch (e) {
            if (e instanceof NotAuthorizedError) {
                this.tokenManager.flagAsInvalid();
            }

            throw (e);
        }
    }
}