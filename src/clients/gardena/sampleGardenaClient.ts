
import * as fs from 'fs';
import { GardenaClient, LocationResponse, LocationsResponse } from './gardenaClient';

/**
 * Defines the file location of the getLocations sample json response.
 */
const LOCATIONS_SAMPLE_LOCATION = './samples/gardena/get_locations_1.json';

/**
 * Defines the file location of the getLocation sample json response.
 */
const LOCATION_SAMPLE_LOCATION = './samples/gardena/location_1.json';

/**
 * A {@link GardenaClient} which uses sample files to simulate responses from the server.
 */
export class SampleGardenaClientImpl implements GardenaClient {
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