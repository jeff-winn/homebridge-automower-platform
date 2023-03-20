import { Logging } from 'homebridge';
import { It, Mock, Times } from 'moq.ts';

import { ForceDebugLogger } from '../../../src/diagnostics/loggers/forceDebugLogger';
import { ConsoleWrapper } from '../../../src/diagnostics/primitives/consoleWrapper';
import { Environment } from '../../../src/primitives/environment';
import { Localization } from '../../../src/primitives/localization';

describe('ForceDebugLogger', () => {
    let console: Mock<ConsoleWrapper>;
    let env: Mock<Environment>;
    let locale: Mock<Localization>;
    let log: Mock<Logging>;

    let target: ForceDebugLogger;

    beforeEach(() => {
        console = new Mock<ConsoleWrapper>();
        env = new Mock<Environment>();
        locale = new Mock<Localization>();
        log = new Mock<Logging>();
        
        target = new ForceDebugLogger(console.object(), log.object(), locale.object(), env.object());
    });

    it('should log the message to the console', () => {
        locale.setup(o => o.format('hello', 'world')).returns('hello world');
        console.setup(o => o.stdout(It.IsAny())).returns(undefined);

        target.debug('hello', 'world');

        console.verify(o => o.stdout('hello world'), Times.Once());
    });
});