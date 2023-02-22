import * as fs from 'fs';
import * as path from 'path';

import { env } from 'process';

/**
 * A wrapper around the environment.
 */
export interface Environment {
    /**
     * Indicates whether the plugin is running within a development environment.
     */
    isDevelopmentEnvironment(): boolean;

    /**
     * Gets the 'DEBUG' environment variable.
     */
    getDebugEnvironmentVariable(): string | undefined;

    /**
     * Gets the fully-qualified root directory of the package.
     * @remarks This is derived from the location of the nearest 'package.json' file hierarchically above the implementation class within the directory tree.
     */
     getPackageRoot(): string;
}

/**
 * An implementation of an environment running within node.js.
 */
export class NodeJsEnvironment implements Environment {
    public isDevelopmentEnvironment(): boolean {
        return env.DEVELOPMENT !== undefined && env.DEVELOPMENT === '1';
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