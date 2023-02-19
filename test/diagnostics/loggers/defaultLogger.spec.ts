import { Logging } from 'homebridge';
import { It, Mock, Times } from 'moq.ts';

import { DefaultLogger } from '../../../src/diagnostics/loggers/defaultLogger';
import { Environment } from '../../../src/primitives/environment';
import { Localization } from '../../../src/primitives/localization';

describe('DefaultLogger', () => {
    let logger: Mock<Logging>;
    let locale: Mock<Localization>;
    let env: Mock<Environment>;

    let target: DefaultLogger;

    beforeEach(() => {
        logger = new Mock<Logging>();
        locale = new Mock<Localization>();
        env = new Mock<Environment>();

        target = new DefaultLogger(logger.object(), locale.object(), env.object());
    });

    it('should log debug to the homebridge logger', () => {
        locale.setup(o => o.format('hello', 'world')).returns('hello world');
        logger.setup(o => o.debug(It.IsAny(), It.IsAny())).returns(undefined);

        target.debug('hello', 'world');        

        logger.verify(o => o.debug('hello world'), Times.Once());
    });

    it('should log info to the homebridge logger', () => {
        locale.setup(o => o.format('hello', 'world')).returns('hello world');
        logger.setup(o => o.info(It.IsAny(), It.IsAny())).returns(undefined);

        target.info('hello', 'world');        

        logger.verify(o => o.info('hello world'), Times.Once());
    });

    it('should log warn to the homebridge logger', () => {
        locale.setup(o => o.format('hello', 'world')).returns('hello world');
        logger.setup(o => o.warn(It.IsAny(), It.IsAny())).returns(undefined);

        target.warn('hello', 'world');        

        logger.verify(o => o.warn('hello world'), Times.Once());
    });

    it('should log error to the homebridge logger', () => {
        locale.setup(o => o.format('hello', 'world')).returns('hello world');
        logger.setup(o => o.error(It.IsAny(), It.IsAny())).returns(undefined);

        target.error('hello', 'world');        

        logger.verify(o => o.error('hello world'), Times.Once());
    });
});