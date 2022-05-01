import { Logging } from 'homebridge';
import { AccessTokenManager } from '../authentication/accessTokenManager';
import { AutomowerEventStreamClient } from '../../clients/automowerEventStreamClient';
import { AutomowerEvent, AutomowerEventTypes, StatusEvent } from '../../events';
import { Timer } from '../../primitives/timer';

export interface EventStreamService {
    onStatusEventReceived(callback: (event: StatusEvent) => Promise<void>): void;
    
    start(): Promise<void>;
    
    stop(): Promise<void>;
}

export class EventStreamServiceImpl implements EventStreamService {
    private readonly KEEP_ALIVE_INTERVAL = 60000; // One minute
    private readonly RECONNECT_INTERVAL = 3600000; // One hour

    private onStatusEventCallback?: (event: StatusEvent) => Promise<void>;
    private started?: Date;
    private lastEventReceived?: Date;
    private attached = false;

    constructor(private tokenManager: AccessTokenManager, private stream: AutomowerEventStreamClient, 
        private log: Logging, private timer: Timer) { }

    onStatusEventReceived(callback: (event: StatusEvent) => Promise<void>): void {
        this.onStatusEventCallback = callback;        
    }

    async start(): Promise<void> {
        if (!this.attached) {
            this.stream.on(this.onEventReceived.bind(this));
            this.attached = true;
        }

        await this.connect();
        this.startKeepAlive();

        this.setStarted(new Date());
    }

    protected setStarted(value?: Date): void {
        this.started = value;
    }

    private async connect(): Promise<void> {
        const token = await this.tokenManager.getCurrentToken();
        this.stream.open(token);
    }

    public getReconnectInterval(): number {
        return this.RECONNECT_INTERVAL;
    }

    private startKeepAlive() {
        this.timer.start(this.keepAlive.bind(this), this.KEEP_ALIVE_INTERVAL);
    }
    
    protected async keepAlive(): Promise<void> {
        try {           
            if (this.shouldReconnect()) {
                await this.reconnect();
            } else {
                this.pingOnce();
            }
        } finally {
            // Restart the timer.
            this.startKeepAlive();
        }
    }    

    protected shouldReconnect(): boolean {
        const now = new Date();
        
        if (this.lastEventReceived === undefined && this.started !== undefined && 
            ((now.getTime() - this.started.getTime()) > this.getReconnectInterval())) {
            // No message has been received, and the client was started an hour ago.
            return true;
        }

        if (this.lastEventReceived !== undefined && 
            ((now.getTime() - this.lastEventReceived.getTime()) > this.getReconnectInterval())) {
            // A message has not been received within the last hour.
            return true;
        }

        return false;
    }

    protected async reconnect(): Promise<void> {
        this.disconnect();
        await this.connect();

        this.setStarted(new Date());
    }

    protected pingOnce(): void {
        this.stream.ping();
    }

    stop(): Promise<void> {
        this.disconnect();
        this.stopKeepAlive();

        return Promise.resolve(undefined);
    }

    protected disconnect(): void {
        this.stream.close();
    }
    
    protected stopKeepAlive(): void {
        this.timer.stop();
    }

    protected setLastEventReceived(value?: Date): void {
        this.lastEventReceived = value;
    }

    protected onEventReceived(event: AutomowerEvent): Promise<void> {
        this.setLastEventReceived(new Date());

        switch (event.type) {
        case AutomowerEventTypes.SETTINGS:
        case AutomowerEventTypes.POSITIONS:
            return Promise.resolve(undefined);

        case AutomowerEventTypes.STATUS:
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