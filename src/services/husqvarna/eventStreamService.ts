import { EventStreamClient } from '../../clients/eventStreamClient';
import { PlatformLogger } from '../../diagnostics/platformLogger';
import { BadCredentialsError } from '../../errors/badCredentialsError';
import { MowerSettingsChangedEvent, MowerStatusChangedEvent } from '../../events';
import { Timer } from '../../primitives/timer';
import { AccessTokenManager } from './accessTokenManager';

/**
 * A mechanism which is capable of streaming events for the Husqvarna account.
 */
export interface EventStreamService {
    /**
     * Occurs when a {@link StatusEvent} has been received.
     * @param callback The callback to execute.
     */
    onStatusEventReceived(callback: (event: MowerStatusChangedEvent) => Promise<void>): void;
    
    /**
     * Occurs when a {@link SettingsEvent} has been received.
     * @param callback The callback to execute.
     */
    onSettingsEventReceived(callback: (event: MowerSettingsChangedEvent) => Promise<void>): void;

    /**
     * Starts streaming events.
     */
    start(): Promise<void>;
    
    /**
     * Stops streaming events.
     */
    stop(): Promise<void>;
}

/**
 * An abstract {@link EventStreamService} which supports management of an {@link EventStreamClient} instance.
 */
export abstract class AbstractEventStreamService<TStream extends EventStreamClient> implements EventStreamService {
    private readonly KEEP_ALIVE_INTERVAL = 60000; // One minute
    private readonly RECONNECT_INTERVAL = 3600000; // One hour

    private onStatusEventCallback?: (event: MowerStatusChangedEvent) => Promise<void>;
    private onSettingsEventCallback?: (event: MowerSettingsChangedEvent) => Promise<void>;

    private keepAliveActive = false;
    private started?: Date;
    private lastEventReceived?: Date;
    private attached = false;

    private stopping = false;
    private stopped = true;

    public constructor(private tokenManager: AccessTokenManager, private stream: TStream, 
        protected readonly log: PlatformLogger, private timer: Timer) { }

    public onSettingsEventReceived(callback: (event: MowerSettingsChangedEvent) => Promise<void>): void {
        this.onSettingsEventCallback = callback;        
    }

    public onStatusEventReceived(callback: (event: MowerStatusChangedEvent) => Promise<void>): void {
        this.onStatusEventCallback = callback;        
    }

    public async start(): Promise<void> {
        if (!this.attached) { 
            this.stream.onConnected(this.onConnectedEventReceived.bind(this));
            this.stream.onDisconnected(this.onDisconnectedEventReceived.bind(this));
            this.stream.onError(this.onErrorEventReceived.bind(this));
            this.attachTo(this.stream);

            this.attached = true;
        }

        await this.connect();
        this.startKeepAlive();

        this.setStarted(new Date());
        this.setLastEventReceived();

        this.flagAsStarted();
    }

    protected abstract attachTo(stream: TStream): void;

    protected flagAsStarted(): void {
        this.stopping = false;
        this.stopped = false;
    }

    protected onConnectedEventReceived(): Promise<void> {
        this.log.debug('CONNECTED');

        if (this.isKeepAliveActive()) {
            this.startKeepAlive();
            this.clearKeepAliveFlag();
        }

        return Promise.resolve(undefined);
    }

    protected onErrorEventReceived(): Promise<void> {        
        if (this.isKeepAliveActive()) {
            this.startKeepAlive();
            this.clearKeepAliveFlag();
        }
        
        return Promise.resolve(undefined);
    }

    protected async onDisconnectedEventReceived(): Promise<void> {
        this.log.debug('DISCONNECTED');

        if (this.isStopping()) {
            // The service is intentionally being stopped.
            this.flagAsStopped();
        } else if (!this.isKeepAliveActive()) {
            // The keep alive is not already active, attempt to trigger the reconnection immediately.
            this.stopKeepAlive();

            await this.keepAlive();
        }
    }

    protected hasStopped(): boolean {
        return this.stopped;
    }

    protected isStopping(): boolean {
        return this.stopping;
    }

    protected flagAsStopped(): void {
        this.stopping = false;
        this.stopped = true;
    }

    protected getStarted(): Date | undefined {
        return this.started;
    }

    protected setStarted(value?: Date): void {
        this.started = value;
    }

    private async connect(): Promise<void> {
        this.log.debug('OPENING_CONNECTION');

        try {
            const token = await this.tokenManager.getCurrentToken();
            this.stream.open(token);
        } catch (e) {
            if (e instanceof BadCredentialsError) {
                this.tokenManager.flagAsInvalid();
            }
            
            throw e;
        }
    }

    public getReconnectInterval(): number {
        return this.RECONNECT_INTERVAL;
    }

    protected startKeepAlive(): void {
        this.timer.start(this.keepAlive.bind(this), this.KEEP_ALIVE_INTERVAL);
    }
    
    protected async keepAlive(): Promise<void> {        
        try {
            if (this.shouldReconnect()) {
                this.flagAsKeepAliveActive();

                try {
                    await this.reconnect();
                } catch (e) {
                    // Something happened while the keep alive was trying to run, make sure it can restart.
                    this.clearKeepAliveFlag();
                    throw e;
                }
            } else {
                this.pingOnce();
            }
        } catch (e) {
            this.log.error('ERROR_KEEPING_STREAM_ALIVE', e);
        } finally {
            if (!this.isKeepAliveActive()) {
                // The keep alive is not trying to reconnect, restart the timer.
                this.startKeepAlive();
            }            
        }
    }
    
    protected flagAsKeepAliveActive(): void {
        this.keepAliveActive = true;
    }

    protected clearKeepAliveFlag(): void {
        this.keepAliveActive = false;
    }

    protected isKeepAliveActive(): boolean {
        return this.keepAliveActive;
    }

    protected shouldReconnect(): boolean {
        this.log.debug('CHECKING_KEEP_ALIVE');
        let result = false;

        if (!this.stream.isConnected()) {
            this.log.debug('UNEXPECTED_STREAM_DISCONNECT');
            result = true;
        } else {
            const now = new Date();
            
            if (this.lastEventReceived === undefined && this.started !== undefined && 
                ((now.getTime() - this.started.getTime()) > this.getReconnectInterval())) {
                this.log.debug('NO_MESSAGE_RECEIVED');
                result = true;
            } else if (this.lastEventReceived !== undefined && 
                ((now.getTime() - this.lastEventReceived.getTime()) > this.getReconnectInterval())) {
                this.log.debug('NO_RECENT_MESSAGE_RECEIVED');
                result = true;
            }
        }

        if (!result) {
            this.log.debug('RECONNECT_NOT_NEEDED');
        }

        return result;
    }

    protected async reconnect(): Promise<void> {
        this.disconnect();
        await this.connect();

        this.setStarted(new Date());
        this.setLastEventReceived();
    }

    protected pingOnce(): void {
        this.stream.ping();
    }

    public stop(): Promise<void> {
        this.flagAsStopping();

        this.stopKeepAlive();
        this.disconnect();

        return Promise.resolve(undefined);
    }

    protected flagAsStopping(): void {
        this.stopping = true;
        this.stopped = false;
    }

    protected disconnect(): void {
        if (!this.stream.isConnected()) {
            // The stream isn't connected. Attempting to close the stream will result in unnecessary errors being thrown.
            this.flagAsStopped();            
            return;
        }

        this.log.debug('CLOSING_STREAM');

        this.stream.close();

        this.log.debug('CLOSED_STREAM');
    }
    
    protected stopKeepAlive(): void {
        this.timer.stop();
    }

    protected getLastEventReceived(): Date | undefined {
        return this.lastEventReceived;
    }
    
    protected setLastEventReceived(value?: Date): void {
        this.lastEventReceived = value;
    }

    protected shouldRaiseMowerSettingsChangedEvent(): boolean {
        return this.onSettingsEventCallback !== undefined;
    }

    protected raiseMowerSettingsChangedEvent(event: MowerSettingsChangedEvent): Promise<void> {
        if (this.onSettingsEventCallback === undefined) {
            return Promise.resolve(undefined);
        }

        return this.onSettingsEventCallback(event);
    }

    protected shouldRaiseMowerStatusChangedEvent(): boolean {
        return this.onStatusEventCallback !== undefined;
    }

    protected raiseMowerStatusChangedEvent(event: MowerStatusChangedEvent): Promise<void> {
        if (this.onStatusEventCallback === undefined) {
            return Promise.resolve(undefined);
        }

        return this.onStatusEventCallback(event);
    }
}