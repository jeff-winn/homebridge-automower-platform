import { It, Mock, Times } from 'moq.ts';

import { ConsoleWrapper } from '../../src/diagnostics/primitives/consoleWrapper';
import { HomebridgeImitationLogger } from '../../src/diagnostics/platformLogger';
import { LogLevel } from 'homebridge';

describe('HomebridgeImitationLogger', () => {
    it('should not log when the minimum level not met', () => {
        const console = new Mock<ConsoleWrapper>();
        const target = new HomebridgeImitationLogger(LogLevel.ERROR, 'platform', console.object());

        console.setup(o => o.stdout(It.IsAny())).returns(undefined);

        target.debug('hello');
        
        console.verify(o => o.stdout(It.IsAny()), Times.Never());
    });

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

    it('should return "0" for debug', () => {
        const level = HomebridgeImitationLogger.getLevel(LogLevel.DEBUG);
        expect(level).toBe(0);
    });

    it('should return "1" for info', () => {
        const level = HomebridgeImitationLogger.getLevel(LogLevel.INFO);
        expect(level).toBe(1);
    });

    it('should return "2" for warn', () => {
        const level = HomebridgeImitationLogger.getLevel(LogLevel.WARN);
        expect(level).toBe(2);
    });

    it('should return "3" for error', () => {
        const level = HomebridgeImitationLogger.getLevel(LogLevel.ERROR);
        expect(level).toBe(3);
    });
});