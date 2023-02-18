import { GardenaEventStreamService } from '../../../../src/services/husqvarna/gardena/gardenaEventStreamService';

describe('GardenaEventStreamService', () => {
    let target: GardenaEventStreamService;

    beforeEach(() => {
        target = new GardenaEventStreamService();
    });

    it('should do nothing on start', async () => { // TODO: This test needs to be removed.
        await target.start();
    });

    it('should do nothing on stop', async () => { // TODO: This test needs to be removed.
        await target.stop();
    });

    it('should do nothing on set positions callback', () => {
        target.onPositionsEventReceived(() => {
            return Promise.resolve(undefined);
        });
    });

    it('should do nothing on set settings callback', () => {
        target.onSettingsEventReceived(() => {
            return Promise.resolve(undefined);
        });
    });

    it('should do nothing on set status event callback', () => {
        target.onStatusEventReceived(() => {
            return Promise.resolve(undefined);
        });
    });
});