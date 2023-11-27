import { PlatformLogger } from '../../src/diagnostics/platformLogger';
import { RetryerFetchClientSpy } from './retryerFetchClientSpy';

import { It, Mock } from 'moq.ts';
import { Response } from 'node-fetch';

describe('RetryerFetchClient', () => {
    let log: Mock<PlatformLogger>;

    beforeEach(() => {
        log = new Mock<PlatformLogger>();    

        log.setup(o => o.debug(It.IsAny())).returns(undefined);
    });

    it('should wait as expected', async () => {
        const target = new RetryerFetchClientSpy(log.object(), 0);
        const delay = 1000;

        const started = new Date().getTime();

        await target.unsafeWait(delay);

        const finished = new Date().getTime();

        expect(finished - started).toBeGreaterThanOrEqual(750);
    });

    it('should create a new instance without max attempts specified', () => {
        const t = new RetryerFetchClientSpy(log.object());

        expect(t).toBeDefined();
    });

    it('should create a new instance with max attempts specified', () => {
        const t = new RetryerFetchClientSpy(log.object(), 5);

        expect(t).toBeDefined();
    });

    it('should not retry on 200 response', async () => {
        const target = new RetryerFetchClientSpy(log.object(), 0);
        const url = 'http://localhost';

        target.responseCallback = () => new Response(undefined, {
            headers: { },
            size: 0,
            status: 200,
            statusText: 'Ok',
            timeout: 0,
            url: url,
        });
        
        const result = await target.executeAsync(url, {
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
        const target = new RetryerFetchClientSpy(log.object(), 0);
        const url = 'http://localhost';

        target.responseCallback = () => new Response(undefined, {
            headers: { },
            size: 0,
            status: 429,
            statusText: 'TOO MANY REQUESTS',
            timeout: 0,
            url: url,
        });    
        
        const result = await target.executeAsync(url, {
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
        const target = new RetryerFetchClientSpy(log.object(), 5);
        const url = 'http://localhost';

        target.responseCallback = () => new Response(undefined, {
            headers: { },
            size: 0,
            status: 429,
            statusText: 'TOO MANY REQUESTS',
            timeout: 0,
            url: url,
        });
        
        const result = await target.executeAsync(url, {
            method: 'GET'
        });

        expect(result.status).toBe(429);
        expect(target.waited).toBeTruthy();
        expect(target.tooManyRequests).toBe(5);
        expect(target.attempts).toBe(5);
    });

    it('should not retry on 503 when retry attempts is zero', async () => {
        const target = new RetryerFetchClientSpy(log.object(), 0);
        const url = 'http://localhost';

        target.responseCallback = () => new Response('{ "hello": "world" }', {
            headers: { },
            size: 0,
            status: 503,
            statusText: 'SERVICE UNAVAILABLE',
            timeout: 0,
            url: url,
        });
        
        const result = await target.executeAsync(url, { });

        expect(result.status).toBe(503);
        expect(target.waited).toBeTruthy();
        expect(target.serviceUnavailable).toBe(1);
        expect(target.attempts).toBe(1);
    });

    it('should retry on 503 when retry attempts is 2', async () => {
        const target = new RetryerFetchClientSpy(log.object(), 2);
        const url = 'http://localhost';

        target.responseCallback = () => new Response(undefined, {
            headers: { },
            size: 0,
            status: 503,
            statusText: 'SERVICE UNAVAILABLE',
            timeout: 0,
            url: url,
        });
        
        const result = await target.executeAsync(url, {
            method: 'GET'
        });

        expect(result.status).toBe(503);
        expect(target.waited).toBeTruthy();
        expect(target.serviceUnavailable).toBe(2);
        expect(target.attempts).toBe(2);
    });

    it('should retry on 429 and 503 when retry attempts is 2', async () => {
        const target = new RetryerFetchClientSpy(log.object(), 2);
        const url = 'http://localhost';

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
        
        const result = await target.executeAsync(url, {
            method: 'GET'
        });

        expect(result.status).toBe(503);
        expect(target.waited).toBeTruthy();
        expect(target.tooManyRequests).toBe(1);
        expect(target.serviceUnavailable).toBe(1);
        expect(target.attempts).toBe(2);
    });
});