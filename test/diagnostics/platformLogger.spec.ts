import { It, Mock, Times } from 'moq.ts';

import { ConsoleWrapper } from '../../src/diagnostics/primitives/consoleWrapper';
import { HomebridgeImitationLogger } from '../../src/diagnostics/platformLogger';
import { LogLevel } from 'homebridge';

describe('HomebridgeImitationLogger', () => {
    it('should log the debug to stdout', () => {
        const console = new Mock<ConsoleWrapper>();
        const target = new HomebridgeImitationLogger(LogLevel.DEBUG, 'platform', console.object());

        console.setup(o => o.stdout(It.IsAny())).returns(undefined);

        target.debug('hello');
        
        console.verify(o => o.stdout(It.IsAny()), Times.Once());
    });

    it('should log the information to stdout', () => {
        const console = new Mock<ConsoleWrapper>();
        const target = new HomebridgeImitationLogger(LogLevel.DEBUG, 'platform', console.object());

        console.setup(o => o.stdout(It.IsAny())).returns(undefined);

        target.info('hello');
        
        console.verify(o => o.stdout(It.IsAny()), Times.Once());
    });

    it('should log the warning to stderr', () => {
        const console = new Mock<ConsoleWrapper>();
        const target = new HomebridgeImitationLogger(LogLevel.DEBUG, 'platform', console.object());

        console.setup(o => o.stderr(It.IsAny())).returns(undefined);

        target.warn('hello');
        
        console.verify(o => o.stderr(It.IsAny()), Times.Once());
    });

    it('should log the error to stderr', () => {
        const console = new Mock<ConsoleWrapper>();
        const target = new HomebridgeImitationLogger(LogLevel.DEBUG, 'platform', console.object());

        console.setup(o => o.stderr(It.IsAny())).returns(undefined);

        target.error('hello');
        
        console.verify(o => o.stderr(It.IsAny()), Times.Once());
    });
});