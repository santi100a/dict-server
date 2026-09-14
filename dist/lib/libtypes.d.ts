import { DictResponse } from '../response.class';
export interface DictCommand {
    readonly name: string;
    readonly parameters: string[];
    readonly raw: string;
    readonly syntaxValid: boolean;
}
export interface DatabaseRecord extends DictDatabase {
    readonly helpText: string;
}
export interface ServerConfig {
    /** The generator function for the message ID in the welcome banner. */
    readonly messageIdGenerator?: () => string;
    /** The available databases with their info text. */
    readonly databases: Record<string, DatabaseRecord>;
    /** The available strategies. */
    readonly strategies: DictStrategy[];
    /** The hostname to report in the welcome banner. */
    readonly hostname?: string;
    /** The welcome text to include in the banner. */
    readonly welcomeText?: string;
    /** The capabilities to report in the welcome banner. */
    readonly capabilities?: string[];
    /** The help text for the server. */
    readonly helpText: string;
    /** The info text for the server. */
    readonly infoText: string;
    /** A map of alternative status code messages. */
    readonly statusMessages?: Record<string | number, string>;
    /**
     * The maximum number of connections to accept. Beyond this limit,
     * status code 420 is sent. Default is 100.
    */
    readonly connectionLimit?: number;
    /**
     * The maximum number of milliseconds a client may be idle before
     * the server closes the connection. Default is 120,000 ms (2 minutes).
    */
    readonly idleDelay?: number;
}
export interface FilterResult {
    readonly canConnect: boolean;
    readonly statusCode: number;
    readonly statusMessage: string;
}
/** An object containing a definition retrieved from the DICT server. */
export interface DictDefinition {
    /** The word that was queried from the server. */
    readonly headword: string;
    /** The definition text for the word. */
    readonly definition: string;
    /** The name of the dictionary the definition came from. */
    readonly dictionary: string;
    /** The description of the dictionary the definition came from. */
    readonly dictionaryDescription: string;
}
/** Information about a DICT database (i.e. a dictionary). */
export interface DictDatabase {
    /** The description string of the DICT database (dictionary). */
    readonly description: string;
    /** Whether or not this database requires prior authentication. */
    readonly authRequired: boolean;
    /** The corresponding info text for the database. */
    readonly infoText: string;
}
/** Information about a matching strategy. */
export interface DictStrategy {
    /** The name of a matching strategy. */
    readonly name: string;
    /** The description string of a matching strategy. */
    readonly description: string;
}
export interface MatchEntry {
    /** The name of the dictionary the match came from. */
    readonly dictionary: string;
    /** The matched word. */
    readonly word: string;
}
export type CommandHandler<T = unknown, R extends DictResponse = DictResponse> = (command: DictCommand, response: R) => T;
export type Interceptor<T = unknown, R extends DictResponse = DictResponse> = (command: DictCommand, response: R, next: Interceptor) => T;
export type ErrorHandler<T = unknown, R extends DictResponse = DictResponse> = (errorCode: number, command: DictCommand | null, response: R) => T;
