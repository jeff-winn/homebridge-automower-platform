import { MowerControlService } from '../mowerControlService';

export class GardenaMowerControlService implements MowerControlService {
    public pause(mowerId: string): Promise<void> {
        // TODO: This method needs to be implemented.
        return Promise.resolve(undefined);
    }

    public resumeSchedule(mowerId: string): Promise<void> {
        // TODO: This method needs to be implemented.
        return Promise.resolve(undefined);
    }

    public parkUntilFurtherNotice(mowerId: string): Promise<void> {
        // TODO: This method needs to be implemented.
        return Promise.resolve(undefined);
    }
}