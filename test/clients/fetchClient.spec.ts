import { It, Mock } from 'moq.ts';
import { Response } from 'node-fetch';
import { ShouldLogHeaderPolicy } from '../../src/clients/fetchClient';
import { PlatformLogger } from '../../src/diagnostics/platformLogger';
import { RetryerFetchClientSpy } from './retryerFetchClientSpy';

describe('RetryerFetchClient', () => {
    let log: Mock<PlatformLogger>;
    let policy: Mock<ShouldLogHeaderPolicy>;

    const url = 'http://localhost/hello/world';
    
    beforeEach(() => {
        log = new Mock<PlatformLogger>();
        policy = new Mock<ShouldLogHeaderPolicy>;

        log.setup(o => o.debug(It.IsAny())).returns(undefined);
    });

    it('should wait as expected', async () => {
        const target = new RetryerFetchClientSpy(log.object(), policy.object(), 0);
        const delay = 1000;

        const started = new Date().getTime();

        await target.unsafeWait(delay);

        const finished = new Date().getTime();

        expect(finished - started).toBeGreaterThanOrEqual(750);
    });

    it('should not log any request headers', async () => {
        const target = new RetryerFetchClientSpy(log.object(), policy.object(), 0);
        
        target.responseCallback = () => new Response(undefined, {
            headers: undefined,
            size: 0,
            status: 200,
            statusText: 'Ok',
            timeout: 0,
            url: url,
        });
        
        policy.setup(o => o.shouldLog(It.IsAny(), It.IsAny())).returns(true);
        
        const result = await target.execute(url);

        expect(result.status).toBe(200);
        expect(target.waited).toBeFalsy();
        expect(target.tooManyRequests).toBe(0);
        expect(target.attempts).toBe(1);
    });

    it('should not log any request or response headers', async () => {
        const target = new RetryerFetchClientSpy(log.object(), policy.object(), 0);
        
        target.responseCallback = () => new Response(undefined, {
            headers: undefined,
            size: 0,
            status: 200,
            statusText: 'Ok',
            timeout: 0,
            url: url,
        });
        
        policy.setup(o => o.shouldLog(It.IsAny(), It.IsAny())).returns(true);
        
        const result = await target.execute(url, {
            method: 'POST',
            headers: undefined,
            body: 'hello'
        });

        expect(result.status).toBe(200);
        expect(target.waited).toBeFalsy();
        expect(target.tooManyRequests).toBe(0);
        expect(target.attempts).toBe(1);
    });

    it('should not retry on 200 response', async () => {
        const target = new RetryerFetchClientSpy(log.object(), policy.object(), 0);
        
        target.responseCallback = () => new Response(undefined, {
            headers: { },
            size: 0,
            status: 200,
            statusText: 'Ok',
            timeout: 0,
            url: url,
        });
        
        policy.setup(o => o.shouldLog(It.IsAny(), It.IsAny())).returns(false);
        
        const result = await target.execute(url, {
            method: 'POST',
            headers: {
                'X-Api-Key': '12345'
            },
            body: 'hello'
        });

        expect(result.status).toBe(200);
        expect(target.waited).toBeFalsy();
        expect(target.tooManyRequests).toBe(0);
        expect(target.attempts).toBe(1);
    });

    it('should not retry on 429 when retry attempts is zero', async () => {
        const target = new RetryerFetchClientSpy(log.object(), policy.object(), 0);
        
        target.responseCallback = () => new Response(undefined, {
            headers: { },
            size: 0,
            status: 429,
            statusText: 'TOO MANY REQUESTS',
            timeout: 0,
            url: url,
        });
        
        policy.setup(o => o.shouldLog(It.IsAny(), It.IsAny())).returns(true);
        
        const result = await target.execute(url, {
            method: 'POST',
            headers: {
                'X-Api-Key': '12345'
            },
            body: 'hello'
        });

        expect(result.status).toBe(429);
        expect(target.waited).toBeTruthy();
        expect(target.tooManyRequests).toBe(1);
        expect(target.attempts).toBe(1);
    });

    it('should retry on 429 when retry attempts is 5', async () => {
        const target = new RetryerFetchClientSpy(log.object(), policy.object(), 5);
        
        target.responseCallback = () => new Response(undefined, {
            headers: { },
            size: 0,
            status: 429,
            statusText: 'TOO MANY REQUESTS',
            timeout: 0,
            url: url,
        });
        
        const result = await target.execute(url, {
            method: 'GET'
        });

        expect(result.status).toBe(429);
        expect(target.waited).toBeTruthy();
        expect(target.tooManyRequests).toBe(5);
        expect(target.attempts).toBe(5);
    });

    it('should not retry on 503 when retry attempts is zero', async () => {
        const target = new RetryerFetchClientSpy(log.object(), policy.object(), 0);
        
        target.responseCallback = () => new Response('{ "hello": "world" }', {
            headers: { },
            size: 0,
            status: 503,
            statusText: 'SERVICE UNAVAILABLE',
            timeout: 0,
            url: url,
        });

        policy.setup(o => o.shouldLog(It.IsAny(), It.IsAny())).returns(true);
        
        const result = await target.execute(url, { });

        expect(result.status).toBe(503);
        expect(target.waited).toBeTruthy();
        expect(target.serviceUnavailable).toBe(1);
        expect(target.attempts).toBe(1);
    });

    it('should retry on 503 when retry attempts is 2', async () => {
        const target = new RetryerFetchClientSpy(log.object(), policy.object(), 2);
        
        target.responseCallback = () => new Response(undefined, {
            headers: { },
            size: 0,
            status: 503,
            statusText: 'SERVICE UNAVAILABLE',
            timeout: 0,
            url: url,
        });
        
        const result = await target.execute(url, {
            method: 'GET'
        });

        expect(result.status).toBe(503);
        expect(target.waited).toBeTruthy();
        expect(target.serviceUnavailable).toBe(2);
        expect(target.attempts).toBe(2);
    });

    it('should retry on 429 and 503 when retry attempts is 2', async () => {
        const target = new RetryerFetchClientSpy(log.object(), policy.object(), 2);
        
        target.responseCallback = () => {
            let status: number;
            if (target.attempts === 1) {
                status = 429;
            } else {
                status = 503;
            }

            return new Response(undefined, {
                headers: { },
                size: 0,
                status: status,
                statusText: 'my message',
                timeout: 0,
                url: url,
            });
        };
        
        const result = await target.execute(url, {
            method: 'GET'
        });

        expect(result.status).toBe(503);
        expect(target.waited).toBeTruthy();
        expect(target.tooManyRequests).toBe(1);
        expect(target.serviceUnavailable).toBe(1);
        expect(target.attempts).toBe(2);
    });
});