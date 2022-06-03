import { env } from 'process';

/**
 * A wrapper around the environment.
 */
export interface Environment {
    /**
     * Gets the 'DEBUG' environment variable.
     */
    getDebugEnvironmentVariable(): string | undefined;
}

/**
 * An implementation of an environment running within node.js.
 */
export class NodeJsEnvironment implements Environment {
    public getDebugEnvironmentVariable(): string | undefined {
        return env.DEBUG;
    }
}