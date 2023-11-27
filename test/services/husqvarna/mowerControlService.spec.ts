import { It, Mock } from 'moq.ts';

import { supportsPause, SupportsPauseControl } from '../../../src/services/husqvarna/mowerControlService';

describe('supportsPause', () => {
    it('should return an object supports pause control', () => {
        const target = new Mock<SupportsPauseControl>();
        target.setup(o => o.pauseAsync(It.IsAny())).returns(Promise.resolve(undefined));

        expect(supportsPause(target.object())).toBeTruthy();
    });

    it('should return an object does not support pause control', () => {
        const target = new Mock<unknown>();
        expect(supportsPause(target.object())).toBeFalsy();
    });
});