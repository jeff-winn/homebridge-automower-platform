import { AutomowerClient } from '../../clients/automowerClient';
import { NotAuthorizedError } from '../../errors/notAuthorizedError';
import { AccessTokenManager } from '../authentication/accessTokenManager';

/**
 * A service which can issue commands to a Husqvarna mower.
 */
export interface MowerControlService {
    /**
     * Resume the mower, according to the schedule.
     * @param mowerId The mower id.
     */
    resumeSchedule(mowerId: string): Promise<void>;
    
    /**
     * Parks the mower until further notice, which overrides the schedule.
     * @param mowerId The mower id.
     */
    parkUntilFurtherNotice(mowerId: string): Promise<void>;
}

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
    constructor(private tokenManager: AccessTokenManager, private client: AutomowerClient) { }

    async resumeSchedule(mowerId: string): Promise<void> {
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

    async parkUntilFurtherNotice(mowerId: string): Promise<void> {
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