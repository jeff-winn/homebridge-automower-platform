import { It, Mock, Times } from 'moq.ts';

import * as settings from '../../src/settings';

import { HomebridgeImitationLogger } from '../../src/diagnostics/platformLogger';
import { ConsoleWrapper } from '../../src/diagnostics/primitives/consoleWrapper';
import { Environment } from '../../src/primitives/environment';
import { Localization } from '../../src/primitives/localization';

describe('HomebridgeImitationLogger', () => {
    let env: Mock<Environment>;
    let console: Mock<ConsoleWrapper>;
    let locale: Mock<Localization>;

    let target: HomebridgeImitationLogger;

    beforeEach(() => {
        env = new Mock<Environment>();
        console = new Mock<ConsoleWrapper>();
        locale = new Mock<Localization>();

        target = new HomebridgeImitationLogger(env.object(), 'platform', 'my instance', console.object(), locale.object());
    });

    it('should log the debug to stdout when enabled via plugin id', () => {
        env.setup(o => o.getDebugEnvironmentVariable()).returns(settings.PLUGIN_ID);
        locale.setup(o => o.format('hello')).returns('hello');

        console.setup(o => o.stdout(It.IsAny())).returns(undefined);

        target.debug('hello');
        
        console.verify(o => o.stdout(It.IsAny()), Times.Once());
    });

    it('should use the cached value when already enabled', () => {
        env.setup(o => o.getDebugEnvironmentVariable()).returns(settings.PLUGIN_ID);

        console.setup(o => o.stdout(It.IsAny())).returns(undefined);
        locale.setup(o => o.format('hello')).returns('hello');
        locale.setup(o => o.format('hello again')).returns('hello again');

        target.debug('hello');
        target.debug('hello again');
        
        console.verify(o => o.stdout(It.IsAny()), Times.Exactly(2));
        env.verify(o => o.getDebugEnvironmentVariable(), Times.Once());
    });

    it('should log the debug to stdout when enabled via asterisk', () => {
        env.setup(o => o.getDebugEnvironmentVariable()).returns('*');

        console.setup(o => o.stdout(It.IsAny())).returns(undefined);
        locale.setup(o => o.format('hello')).returns('hello');

        target.debug('hello');
        
        console.verify(o => o.stdout(It.IsAny()), Times.Once());
    });

    it('should not log the debug to stdout when not enabled', () => {
        env.setup(o => o.getDebugEnvironmentVariable()).returns('not the plugin id');

        console.setup(o => o.stdout(It.IsAny())).returns(undefined);
        locale.setup(o => o.format('hello')).returns('hello');

        target.debug('hello');
        
        console.verify(o => o.stdout(It.IsAny()), Times.Never());
    });

    it('should log the information to stdout', () => {
        console.setup(o => o.stdout(It.IsAny())).returns(undefined);
        locale.setup(o => o.format('hello')).returns('hello');
        
        target.info('hello');
        
        console.verify(o => o.stdout(It.IsAny()), Times.Once());
    });

    it('should log the warning to stderr', () => {
        console.setup(o => o.stderr(It.IsAny())).returns(undefined);
        locale.setup(o => o.format('hello')).returns('hello');

        target.warn('hello');
        
        console.verify(o => o.stderr(It.IsAny()), Times.Once());
    });

    it('should log the error to stderr', () => {
        console.setup(o => o.stderr(It.IsAny())).returns(undefined);
        locale.setup(o => o.format('hello')).returns('hello');

        target.error('hello');
        
        console.verify(o => o.stderr(It.IsAny()), Times.Once());
    });
});
