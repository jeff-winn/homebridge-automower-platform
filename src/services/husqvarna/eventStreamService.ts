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
     * Sets the callback to execute when a {@link MowerStatusChangedEvent} has been received.
     * @param callback The callback to execute.
     */
    setOnStatusEventCallback(callback: (event: MowerStatusChangedEvent) => Promise<void>): void;
    
    /**
     * Sets the callback to execute when a {@link MowerSettingsChangedEvent} has been received.
     * @param callback The callback to execute.
     */
    setOnSettingsEventCallback(callback: (event: MowerSettingsChangedEvent) => Promise<void>): void;

    /**
     * Starts streaming events.
     */
    startAsync(): Promise<void>;
    
    /**
     * Stops streaming events.
     */
    stopAsync(): Promise<void>;
}

/**
 * Defines the stream states.
 */
enum StreamState {
    /**
     * The stream is starting.
     */
    STARTING = 'STARTING',

    /**
     * The stream has started.
     */
    STARTED = 'STARTED',

    /**
     * The stream is stopping.
     */
    STOPPING = 'STOPPING',
    
    /**
     * The stream has stopped.
     */
    STOPPED = 'STOPPED'
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

    private state: StreamState = StreamState.STOPPED;

    public constructor(private tokenManager: AccessTokenManager, private stream: TStream, 
        protected readonly log: PlatformLogger, private timer: Timer) { }

    public setOnSettingsEventCallback(callback: (event: MowerSettingsChangedEvent) => Promise<void>): void {
        this.onSettingsEventCallback = callback;        
    }

    public setOnStatusEventCallback(callback: (event: MowerStatusChangedEvent) => Promise<void>): void {
        this.onStatusEventCallback = callback;        
    }

    public async startAsync(): Promise<void> {
        if (!this.attached) { 
            this.attachTo(this.stream);
            this.attached = true;
        }

        this.flagAsStarting();

        await this.connect();
        this.startKeepAlive();

        this.setStarted(new Date());
        this.setLastEventReceived();

        this.flagAsStarted();
    }

    protected flagAsStarting(): void {
        this.state = StreamState.STARTING;
    }

    protected attachTo(stream: TStream): void {
        stream.setOnConnectedCallback(this.onCheckKeepAliveAsync.bind(this));
        stream.setOnErrorCallback(this.onCheckKeepAliveAsync.bind(this));
        stream.setOnDisconnectedCallback(this.onDisconnectedEventReceivedAsync.bind(this));
    }

    protected flagAsStarted(): void {
        this.state = StreamState.STARTED;
    }

    protected onCheckKeepAliveAsync(): Promise<void> {
        if (this.isKeepAliveActive()) {
            this.startKeepAlive();
            this.clearKeepAliveFlag();
        }

        return Promise.resolve(undefined);
    }    

    protected async onDisconnectedEventReceivedAsync(): Promise<void> {
        if (this.isStopping()) {
            // The service is intentionally being stopped.
            this.flagAsStopped();
        } else if (!this.isKeepAliveActive()) {
            // The keep alive is not already active, attempt to trigger the reconnection immediately.
            this.stopKeepAlive();

            await this.keepAliveAsync();
        }
    }

    protected hasStopped(): boolean {
        return this.state === StreamState.STOPPED;
    }

    protected isStopping(): boolean {
        return this.state === StreamState.STOPPING;
    }

    protected flagAsStopped(): void {
        this.state = StreamState.STOPPED;
    }

    protected getStarted(): Date | undefined {
        return this.started;
    }

    protected setStarted(value?: Date): void {
        this.started = value;
    }

    private async connect(): Promise<void> {
        try {
            const token = await this.tokenManager.getCurrentTokenAsync();

            this.log.debug('STARTING_STREAM');
            await this.stream.open(token);
            this.log.debug('STARTED_STREAM');
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
        this.timer.start(this.keepAliveCallback.bind(this), this.KEEP_ALIVE_INTERVAL);
    }

    protected keepAliveCallback(): void {
        this.keepAliveAsync().then()
            .catch(err => {
                this.log.error('ERROR_KEEPING_STREAM_ALIVE', err);
            });
    }
    
    protected async keepAliveAsync(): Promise<void> {        
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
        await this.disconnect();
        await this.connect();

        this.setStarted(new Date());
        this.setLastEventReceived();
    }

    protected pingOnce(): void {
        this.stream.ping();
    }

    public async stopAsync(): Promise<void> {
        this.flagAsStopping();

        this.stopKeepAlive();
        await this.disconnect();
    }

    protected flagAsStopping(): void {
        this.state = StreamState.STOPPING;
    }

    protected async disconnect(): Promise<void> {
        if (!this.stream.isConnected()) {
            // The stream isn't connected. Attempting to close the stream will result in unnecessary errors being thrown.
            this.flagAsStopped();            
            return;
        }

        this.log.debug('CLOSING_STREAM');
        await this.stream.close();
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

    protected raiseMowerSettingsChangedEvent(event: MowerSettingsChangedEvent): Promise<void> {
        if (this.onSettingsEventCallback === undefined) {
            return Promise.resolve(undefined);
        }

        return this.onSettingsEventCallback(event);
    }

    protected raiseMowerStatusChangedEvent(event: MowerStatusChangedEvent): Promise<void> {
        if (this.onStatusEventCallback === undefined) {
            return Promise.resolve(undefined);
        }

        return this.onStatusEventCallback(event);
    }
}