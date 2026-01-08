import { DictResponse } from '../response.class';
export interface DictCommand {
    readonly name: string;
    readonly parameters: string[];
    readonly raw: string;
    readonly syntaxValid: boolean;
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
    /** The MIME headers for the definition. */
    readonly mimeHeaders?: Record<string, string>;
}
/** Information about a DICT database (i.e. a dictionary). */
export interface DatabaseInfo {
    /** The name of the DICT database (dictionary). */
    readonly name: string;
    /** The description string of the DICT database (dictionary). */
    readonly description: string;
}
/** Information about a matching strategy. */
export interface StrategyInfo {
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
