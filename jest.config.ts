import { Config } from '@jest/types';
import { config } from 'dotenv';

config();

/*
 * For a detailed explanation regarding each configuration property and type check, visit:
 * https://jestjs.io/docs/configuration
 */

export default async (): Promise<Config.InitialOptions> => {
    return {
        preset: 'ts-jest',
        testEnvironment: 'node',
        passWithNoTests: true,
        collectCoverage: false,
        testRegex: '(?<!i)\\.(spec|test)\\.[jt]s$'
    };
};
