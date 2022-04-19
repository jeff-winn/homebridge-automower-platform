import { Logging } from 'homebridge';
import { OAuthTokenManager } from '../../authentication/oauthTokenManager';
import { AutomowerEventStream } from '../../clients/automowerEventStream';
import { AutomowerEvent, StatusEvent } from '../../clients/events';

export interface EventStreamService {
    onStatusEventReceived(callback: (event: StatusEvent) => Promise<void>): void;
    
    start(): Promise<void>;
    
    stop(): Promise<void>;
}

export class EventStreamServiceImpl implements EventStreamService {
    private onStatusEventCallback?: (event: StatusEvent) => Promise<void>;

    constructor(private tokenManager: OAuthTokenManager, private stream: AutomowerEventStream, private log: Logging) { }

    onStatusEventReceived(callback: (event: StatusEvent) => Promise<void>): void {
        this.onStatusEventCallback = callback;        
    }

    async start(): Promise<void> {
        const token = await this.tokenManager.getCurrentToken();

        this.stream.on(this.onEventReceived.bind(this));
        this.stream.open(token);
    }

    stop(): Promise<void> {
        this.stream.close();
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