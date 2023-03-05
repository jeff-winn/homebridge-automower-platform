import { GardenaMowerControlService } from '../../../../src/services/husqvarna/gardena/gardenaMowerControlService';

describe('GardenaMowerControlService', () => {
    let target: GardenaMowerControlService;

    beforeEach(() => {
        target = new GardenaMowerControlService();
    });

    it('should pause the mower', async () => {
        await expect(target.pause('12345')).resolves.toBeUndefined();
    });

    it('should resume the schedule', async () => {
        await expect(target.resumeSchedule('12345')).resolves.toBeUndefined();
    });

    it('should park the mower until further notice', async () => {
        await expect(target.parkUntilFurtherNotice('12345')).resolves.toBeUndefined();
    });
});