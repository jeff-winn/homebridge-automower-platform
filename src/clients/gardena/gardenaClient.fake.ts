
import * as fs from 'fs';
import { env } from 'process';
import { config } from 'dotenv';

import { AccessToken } from '../../model';
import { GardenaClient, GetLocationResponse, GetLocationsResponse } from './gardenaClient';

config();

/**
 * A fake Gardena client used for testing purposes.
 */
export class FakeGardenaClientImpl implements GardenaClient {
    private readonly GET_SINGLE_LOCATION_SAMPLE: string = env.GET_SINGLE_LOCATION_SAMPLE!;
    private readonly GET_LOCATIONS_SAMPLE: string = env.GET_LOCATIONS_SAMPLE!;

    public getLocations(token: AccessToken): Promise<GetLocationsResponse | undefined> {
        const txt = fs.readFileSync(this.GET_LOCATIONS_SAMPLE, 'utf-8');

        const result = JSON.parse(txt) as GetLocationsResponse;
        return Promise.resolve(result);
    }

    public getLocation(locationId: string, token: AccessToken): Promise<GetLocationResponse | undefined> {
        const txt = fs.readFileSync(this.GET_SINGLE_LOCATION_SAMPLE, 'utf-8');

        const result = JSON.parse(txt) as GetLocationResponse;
        return Promise.resolve(result);
    }
}