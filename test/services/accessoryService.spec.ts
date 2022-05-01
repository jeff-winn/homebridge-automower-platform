import { API, Logging } from 'homebridge';
import { Mock } from 'moq.ts';

import { AccessoryFactory } from '../../src/primitives/accessoryFactory';
import { AccessoryServiceImpl } from '../../src/services/accessoryService';

describe('AccessoryService', () => {
    let factory: Mock<AccessoryFactory>;
    let api: Mock<API>;
    let log: Mock<Logging>;

    let target: AccessoryServiceImpl;

    beforeEach(() => {
        factory = new Mock<AccessoryFactory>();
        api = new Mock<API>();
        log = new Mock<Logging>();

        target = new AccessoryServiceImpl(factory.object(), api.object(), log.object());
    });

    it('should be truthy', () => {
        expect(true).toBeTruthy();
    });
});