import { v4 as uuid } from 'uuid';

import { GardenaClient } from '../../../clients/gardena/gardenaClient';
import { NotAuthorizedError } from '../../../errors/notAuthorizedError';
import { AccessTokenManager } from '../accessTokenManager';
import { MowerControlService } from '../mowerControlService';

/**
 * Describes the command types.
 */
export enum CommandType {
    /**
     * A mower control command.
     */
    MOWER_CONTROL = 'MOWER_CONTROL'
}

/**
 * Describes the mower command types.
 */
export enum MowerCommandType {
    /**
     * Manual operation, use 'seconds' attribute to define duration.
     */
    START_SECONDS_TO_OVERRIDE = 'START_SECONDS_TO_OVERRIDE',

    /**
     * Automatic operation.
     */
    START_DONT_OVERRIDE = 'START_DONT_OVERRIDE',

    /**
     * Cancel the current operation and return to charging station.
     */
    PARK_UNTIL_NEXT_TASK = 'PARK_UNTIL_NEXT_TASK',

    /**
     * Cancel the current operation, return to charging station, ignore schedule.
     */
    PARK_UNTIL_FURTHER_NOTICE = 'PARK_UNTIL_FURTHER_NOTICE'
}

/**
 * Describes a mower command.
 */
export interface MowerCommand {
    /**
     * The request id (can be randomly generated).
     */
    id: string;

    /**
     * The type of command.
     */
    type: CommandType;

    /**
     * The attributes (if necessary) for the action.
     */
    attributes: {
        /**
         * The mower command to perform.
         */
        command: MowerCommandType;

        /**
         * Optional. Defines duration of manual mowing, value MUST be positive multiple of 60.
         */
        seconds?: number;
    };
}

/**
 * A {@link MowerControlService} implementation for Gardena which utilizes manual control over the device.
 */
export class GardenaManualMowerControlService implements MowerControlService {
    public constructor(private readonly tokenManager: AccessTokenManager, private readonly client: GardenaClient) { }

    public async resumeAsync(mowerId: string): Promise<void> {
        try {
            const command: MowerCommand = {
                id: uuid(),
                type: CommandType.MOWER_CONTROL,
                attributes: {
                    command: MowerCommandType.START_SECONDS_TO_OVERRIDE,
                    seconds: 21600 // 6 hours, the maximum allowed by the device.
                }
            };

            const token = await this.tokenManager.getCurrentTokenAsync();
            return await this.client.doCommand(mowerId, command, token);
        } catch (e) {
            if (e instanceof NotAuthorizedError) {
                this.tokenManager.flagAsInvalid();
            }

            throw (e);
        }
    }

    public async parkUntilFurtherNoticeAsync(mowerId: string): Promise<void> {
        try {
            const command: MowerCommand = {
                id: uuid(),
                type: CommandType.MOWER_CONTROL,
                attributes: {
                    command: MowerCommandType.PARK_UNTIL_FURTHER_NOTICE
                }
            };

            const token = await this.tokenManager.getCurrentTokenAsync();
            return await this.client.doCommand(mowerId, command, token);
        } catch (e) {
            if (e instanceof NotAuthorizedError) {
                this.tokenManager.flagAsInvalid();
            }

            throw (e);
        }
    }
}