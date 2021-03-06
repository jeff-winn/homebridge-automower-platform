import 'reflect-metadata';

import * as index from '../src/index';

import { API } from 'homebridge';
import { Mock, Times } from 'moq.ts';
import { AutomowerPlatform } from '../src/automowerPlatform';
import { PLATFORM_NAME } from '../src/settings';

describe('index', () => {
    let api: Mock<API>;

    beforeEach(() => {
        api = new Mock<API>();
    });

    it('should register the platform', () => {
        api.setup(x => x.registerPlatform(PLATFORM_NAME, AutomowerPlatform)).returns(undefined);

        index.default(api.object());

        api.verify(x => x.registerPlatform(PLATFORM_NAME, AutomowerPlatform), Times.Once());
    });
});
