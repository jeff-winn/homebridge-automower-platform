import * as fs from 'fs';

import { AccessToken } from '../../model';
import { GardenaClient, LocationResponse, LocationsResponse, WebSocketCreatedResponse } from './gardenaClient';

/**
 * Defines the file location of the getLocations sample json response.
 */
const LOCATIONS_SAMPLE_LOCATION = './samples/gardena/get_locations.json';

/**
 * Defines the file location of the getLocation sample json response.
 */
const LOCATION_SAMPLE_LOCATION = './samples/gardena/get_location.json';

/**
 * A {@link GardenaClient} which uses sample files to simulate responses from the server.
 */
export class SampleGardenaClientImpl implements GardenaClient {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    public createSocket(locationId: string, token: AccessToken): Promise<WebSocketCreatedResponse> {
        throw new Error('This operation is not supported on a sample client.');
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    public doCommand(id: string, command: unknown, token: AccessToken): Promise<void> {
        return Promise.resolve(undefined);
    }

    public getLocations(): Promise<LocationsResponse | undefined> {
        const txt = this.getLocationsSampleFile();    

        const result = JSON.parse(txt) as LocationsResponse;
        return Promise.resolve(result);
    }

    protected getLocationsSampleFile(): string {
        return fs.readFileSync(LOCATIONS_SAMPLE_LOCATION, 'utf-8');
    }

    public getLocation(): Promise<LocationResponse | undefined> {
        const txt = this.getLocationSampleFile();

        const result = JSON.parse(txt) as LocationResponse;
        return Promise.resolve(result);
    }

    protected getLocationSampleFile(): string {
        return fs.readFileSync(LOCATION_SAMPLE_LOCATION, 'utf-8');
    }
}