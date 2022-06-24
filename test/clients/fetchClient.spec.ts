import { It, Mock } from 'moq.ts';
import { Response } from 'node-fetch';

import { PlatformLogger } from '../../src/diagnostics/platformLogger';
import { RetryerFetchClientSpy } from './retryerFetchClientSpy';

describe('RetryerFetchClient', () => {
    let log: Mock<PlatformLogger>;
    const url = 'http://localhost/hello/world';
    
    beforeEach(() => {
        log = new Mock<PlatformLogger>();
        log.setup(o => o.debug(It.IsAny())).returns(undefined);
    });

    it('should not retry on 429 when retry attempts is zero', async () => {
        const target = new RetryerFetchClientSpy(log.object(), 0, 1000);
        
        target.responseCallback = () => new Response(undefined, {
            headers: { },
            size: 0,
            status: 429,
            statusText: 'TOO MANY REQUESTS',
            timeout: 0,
            url: url,
        });
        
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

    it('should retry on 429 when retry attempts is 1', async () => {
        const target = new RetryerFetchClientSpy(log.object(), 1, 1000);
        
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
        expect(target.tooManyRequests).toBe(2);
        expect(target.attempts).toBe(2);
    });

    it('should not retry on 503 when retry attempts is zero', async () => {
        const target = new RetryerFetchClientSpy(log.object(), 0, 1000);
        
        target.responseCallback = () => new Response('{ "hello": "world" }', {
            headers: { },
            size: 0,
            status: 503,
            statusText: 'SERVICE UNAVAILABLE',
            timeout: 0,
            url: url,
        });
        
        const result = await target.execute(url, { });

        expect(result.status).toBe(503);
        expect(target.waited).toBeTruthy();
        expect(target.serviceUnavailable).toBe(1);
        expect(target.attempts).toBe(1);
    });

    it('should retry on 503 when retry attempts is 1', async () => {
        const target = new RetryerFetchClientSpy(log.object(), 1, 1000);
        
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

    it('should retry on 429 and 503 when retry attempts is 1', async () => {
        const target = new RetryerFetchClientSpy(log.object(), 1, 1000);
        
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