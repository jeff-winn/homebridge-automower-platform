import { Config } from '@jest/types';

/*
 * For a detailed explanation regarding each configuration property and type check, visit:
 * https://jestjs.io/docs/configuration
 */

export default async (): Promise<Config.InitialOptions> => {
    return {
        preset: 'ts-jest',
        testEnvironment: 'node',
        passWithNoTests: false,
        collectCoverage: true,
        coverageDirectory: './build/coverage',
        testRegex: '(?<!i)\\.(spec|test)\\.[jt]s$',
        testResultsProcessor: 'jest-sonar-reporter'
    };
};