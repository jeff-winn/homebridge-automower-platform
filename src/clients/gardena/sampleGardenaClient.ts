
import * as fs from 'fs';
import { Environment } from '../../primitives/environment';
import { GardenaClient, LocationResponse, LocationsResponse } from './gardenaClient';

/**
 * A {@link GardenaClient} which uses sample files to simulate responses from the server.
 */
export class SampleGardenaClientImpl implements GardenaClient {
    public constructor(private env: Environment) { }

    public getLocations(): Promise<LocationsResponse | undefined> {
        const txt = fs.readFileSync(this.getLocationsSampleFile(), 'utf-8');

        const result = JSON.parse(txt) as LocationsResponse;
        return Promise.resolve(result);
    }

    protected getLocationsSampleFile(): string {
        return this.env.unsafeGetEnvironmentVariable('GET_LOCATIONS_SAMPLE')!;
    }

    public getLocation(): Promise<LocationResponse | undefined> {
        const txt = fs.readFileSync(this.getSingleLocationSampleFile(), 'utf-8');

        const result = JSON.parse(txt) as LocationResponse;
        return Promise.resolve(result);
    }

    protected getSingleLocationSampleFile(): string {
        return this.env.unsafeGetEnvironmentVariable('GET_SINGLE_LOCATION_SAMPLE')!;
    }
}