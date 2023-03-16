import * as fs from 'fs';
import * as path from 'path';

import { env } from 'process';

/**
 * Indicates whether the plugin is running within a development environment.
 */
export function isDevelopmentEnvironment(): boolean {
    return env.NODE_ENV !== undefined && env.NODE_ENV === 'development';
}

/**
 * A wrapper around the environment.
 */
export interface Environment {
    /**
     * Gets the 'DEBUG' environment variable.
     */
    getDebugEnvironmentVariable(): string | undefined;

    /**
     * Gets the fully-qualified root directory of the package.
     * @remarks This is derived from the location of the nearest 'package.json' file hierarchically above the implementation class within the directory tree.
     */
     getPackageRoot(): string;

     /**
      * UNSAFE: Returns the environment variable specified.
      * @param variable The environment variable.
      */
     unsafeGetEnvironmentVariable(variable: string): string | undefined;
}

/**
 * An implementation of an environment running within node.js.
 */
export class NodeJsEnvironment implements Environment {
    public unsafeGetEnvironmentVariable(variable: string): string | undefined {
        return env[variable];
    }

    public getDebugEnvironmentVariable(): string | undefined {
        return env.DEBUG;
    }

    public getPackageRoot(): string {
        let current = __dirname;

        while(!fs.existsSync(path.join(current, 'package.json'))) {
            current = path.join(current, '..');
        }

        return current;
    }
}