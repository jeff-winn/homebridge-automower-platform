import { Logging } from 'homebridge';
import { OAuthTokenManager } from '../../authentication/oauthTokenManager';
import { AutomowerEventStream } from '../../clients/automowerEventStream';
import { AutomowerEvent, StatusEvent } from '../../clients/events';
import { Timer } from '../../primitives/timer';

export interface EventStreamService {
    onStatusEventReceived(callback: (event: StatusEvent) => Promise<void>): void;
    
    start(): Promise<void>;
    
    stop(): Promise<void>;
}

export class EventStreamServiceImpl implements EventStreamService {
    private readonly KEEP_ALIVE_INTERVAL = 60000;

    private onStatusEventCallback?: (event: StatusEvent) => Promise<void>;

    constructor(private tokenManager: OAuthTokenManager, private stream: AutomowerEventStream, 
        private log: Logging, private timer: Timer) { }

    onStatusEventReceived(callback: (event: StatusEvent) => Promise<void>): void {
        this.onStatusEventCallback = callback;        
    }

    async start(): Promise<void> {
        const token = await this.tokenManager.getCurrentToken();

        this.stream.on(this.onEventReceived.bind(this));
        this.stream.open(token);

        this.startKeepAlive();
    }

    private startKeepAlive() {
        this.timer.start(this.keepAlive.bind(this), this.KEEP_ALIVE_INTERVAL);
    }
    
    protected keepAlive(): void {
        try {
            this.stream.keepAlive();
        } finally {
            // Restart the timer.
            this.startKeepAlive();
        }
    }

    stop(): Promise<void> {
        this.stream.close();
        this.timer.stop();

        return Promise.resolve(undefined);
    }

    protected onEventReceived(event: AutomowerEvent): Promise<void> {
        switch (event.type) {
        case 'settings-event':
        case 'positions-event':
            return Promise.resolve(undefined);

        case 'status-event':
            return this.onStatusEvent(event as StatusEvent);        

        default:
            this.log.warn(`Received unknown event: ${event.type}`);
            return Promise.resolve(undefined);
        }
    }

    protected onStatusEvent(event: StatusEvent): Promise<void> {
        if (this.onStatusEventCallback === undefined) {
            return Promise.resolve(undefined);
        }

        return this.onStatusEventCallback(event);
    }
}