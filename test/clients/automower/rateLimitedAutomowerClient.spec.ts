import { It, Mock } from 'moq.ts';

import { FetchClient, Response } from '../../../src/clients/fetchClient';
import { ErrorFactory } from '../../../src/errors/errorFactory';
import { AccessToken } from '../../../src/model';
import { RateLimitedAutomowerClientSpy } from './rateLimitedAutomowerClientSpy';

describe('RateLimitedAutomowerClient', () => {
    let appKey: string;
    let baseUrl: string;
    let fetch: Mock<FetchClient>;
    let errorFactory: Mock<ErrorFactory>;

    let target: RateLimitedAutomowerClientSpy;

    beforeEach(() => {
        appKey = 'app key';
        baseUrl = 'http://localhost/v1';
        fetch = new Mock<FetchClient>();
        errorFactory = new Mock<ErrorFactory>();

        target = new RateLimitedAutomowerClientSpy(appKey, baseUrl, fetch.object(), errorFactory.object());
    });

    it('should return -1 when never accessed', () => {
        const result = target.unsafeCalculateRateLimitationDelay(new Date());

        expect(result).toBe(-1);
    });

    it('should return -1 when accessed beyond the rate limitation', () => {
        const now = new Date();

        const lastAccessed = new Date();
        lastAccessed.setHours(now.getHours() - 1);

        target.unsafeSetLastAccessed(lastAccessed);

        const result = target.unsafeCalculateRateLimitationDelay(now);

        expect(result).toBe(-1);
    });

    it('should return 500 when accessed within the rate limitation period', () => {
        const now = new Date();

        const lastAccessed = new Date();
        lastAccessed.setMilliseconds(now.getMilliseconds() - 500);

        target.unsafeSetLastAccessed(lastAccessed);

        const result = target.unsafeCalculateRateLimitationDelay(now);

        expect(result).toBe(500);
    });
    
    it('should delay the doAction call when rate limited', async () => {
        const token: AccessToken = {
            provider: 'husqvarna',
            value: 'abcd1234'
        };

        const response = new Response('{ "hello": "world" }', {
            headers: { },
            size: 0,
            status: 200,
            statusText: 'OK',
            timeout: 0,
            url: 'http://localhost',
        });

        fetch.setup(o => o.execute(It.IsAny(), It.IsAny())).returns(Promise.resolve(response));
        target.unsafeSetLastAccessed(new Date());

        await target.doAction('id', { }, token);

        expect(target.waited).toBeTruthy();
    });

    it('should not delay the doAction call when not rate limited', async () => {
        const token: AccessToken = {
            provider: 'husqvarna',
            value: 'abcd1234'
        };

        const response = new Response('{ "hello": "world" }', {
            headers: { },
            size: 0,
            status: 200,
            statusText: 'OK',
            timeout: 0,
            url: 'http://localhost',
        });

        fetch.setup(o => o.execute(It.IsAny(), It.IsAny())).returns(Promise.resolve(response));
        target.unsafeSetLastAccessed(undefined);

        await target.doAction('id', { }, token);

        expect(target.waited).toBeFalsy();
    });

    it('should delay the getMower call when rate limited', async () => {
        const token: AccessToken = {
            provider: 'husqvarna',
            value: 'abcd1234'
        };

        const response = new Response('{ }', {
            headers: { },
            size: 0,
            status: 200,
            timeout: 0,
            url: 'http://localhost',
        });
        
        fetch.setup(o => o.execute(It.IsAny(), It.IsAny())).returns(Promise.resolve(response));
        target.unsafeSetLastAccessed(new Date());

        await target.getMower('id', token);

        expect(target.waited).toBeTruthy();
    });

    it('should not delay the getMower call when not rate limited', async () => {
        const token: AccessToken = {
            provider: 'husqvarna',
            value: 'abcd1234'
        };

        const response = new Response('{ }', {
            headers: { },
            size: 0,
            status: 200,
            timeout: 0,
            url: 'http://localhost',
        });
        
        fetch.setup(o => o.execute(It.IsAny(), It.IsAny())).returns(Promise.resolve(response));
        target.unsafeSetLastAccessed(undefined);

        await target.getMower('id', token);

        expect(target.waited).toBeFalsy();
    });

    it('should delay the getMowers call when rate limited', async () => {
        const token: AccessToken = {
            provider: 'husqvarna',
            value: 'abcd1234'
        };

        const response = new Response('{ }', {
            headers: { },
            size: 0,
            status: 200,
            timeout: 0,
            url: 'http://localhost',
        });
        
        fetch.setup(o => o.execute(It.IsAny(), It.IsAny())).returns(Promise.resolve(response));
        target.unsafeSetLastAccessed(new Date());

        await target.getMowers(token);

        expect(target.waited).toBeTruthy();
    });

    it('should not delay the getMowers call when not rate limited', async () => {
        const token: AccessToken = {
            provider: 'husqvarna',
            value: 'abcd1234'
        };

        const response = new Response('{ }', {
            headers: { },
            size: 0,
            status: 200,
            timeout: 0,
            url: 'http://localhost',
        });
        
        fetch.setup(o => o.execute(It.IsAny(), It.IsAny())).returns(Promise.resolve(response));
        target.unsafeSetLastAccessed(undefined);

        await target.getMowers(token);

        expect(target.waited).toBeFalsy();
    });
});