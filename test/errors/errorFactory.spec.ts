import { It, Mock } from 'moq.ts';

import { BadConfigurationError } from '../../src/errors/badConfigurationError';
import { BadCredentialsError } from '../../src/errors/badCredentialsError';
import { BadOAuthTokenError } from '../../src/errors/badOAuthTokenError';
import { DefaultErrorFactory } from '../../src/errors/errorFactory';
import { NotAuthorizedError } from '../../src/errors/notAuthorizedError';
import { Localization } from '../../src/primitives/localization';

describe('DefaultErrorFactory', () => {
    let locale: Mock<Localization>;
    let target: DefaultErrorFactory;

    beforeEach(() => {
        locale = new Mock<Localization>();

        target = new DefaultErrorFactory(locale.object());
    });

    it('should create a new BadConfigurationError', () => {
        const message = 'message';
        const formattedMessage = 'hello world';

        locale.setup(o => o.format(message, It.IsAny())).returns(formattedMessage);
    
        const result = target.badConfigurationError(message, '12345');

        expect(result).toBeInstanceOf(BadConfigurationError);
    });

    it('should create a new BadCredentialsError', () => {
        const message = 'message';
        const formattedMessage = 'hello world';

        locale.setup(o => o.format(message, It.IsAny())).returns(formattedMessage);
    
        const result = target.badCredentialsError(message, '12345');

        expect(result).toBeInstanceOf(BadCredentialsError);
    });

    it('should create a new BadOAuthTokenError', () => {
        const message = 'message';
        const formattedMessage = 'hello world';

        locale.setup(o => o.format(message, It.IsAny())).returns(formattedMessage);
    
        const result = target.badOAuthTokenError(message, '12345');

        expect(result).toBeInstanceOf(BadOAuthTokenError);
    });

    it('should create a new NotAuthorizedError', () => {
        const message = 'message';
        const formattedMessage = 'hello world';

        locale.setup(o => o.format(message, It.IsAny())).returns(formattedMessage);
    
        const result = target.notAuthorizedError(message, '12345');

        expect(result).toBeInstanceOf(NotAuthorizedError);
    });
});