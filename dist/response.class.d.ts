/// <reference types="node" />
/// <reference types="node" />
import { Socket } from 'node:net';
import { StatusMap } from './lib/libstatuscodes';
import { DatabaseInfo, DictDefinition, MatchEntry } from './lib/libtypes';
/**
 * Utility class for responses from the DICT server.
 * All methods of this class can be chained, except for `write()`.
 */
export declare class DictResponse extends Socket {
    constructor(socket: Socket);
    /** @readonly Whether or not MIME headers are enabled by the `OPTION MIME` command. */
    optionMimeEnabled: boolean;
    /** @readonly The text specified in the `CLIENT` command. */
    clientText: string;
    /**
     * Writes a string as an RFC 5322 internet message (i.e. headers, text,
     * and `<CRLF>.<CRLF>`).
     *
     * @param {string} message - The raw text body of the message.
     * @param {Record} headers - The headers to be added before the message.
     */
    writeMessage(message: string, headers?: Record<string, string>): this;
    /**
     * Writes a line of text and appends `<CRLF>` at the end.
     *
     * @param {string} line - The line to be written. Shouldn't include CR or LF.
     */
    writeLine(line?: string): this;
    /**
     *
     * @param {number} code - The status code to be set.
     * Should be specified in [RFC 2229](https://www.rfc-editor.org/rfc/rfc2229#section-7).
     * @param params - Parameters to be specified for the status code:
     * @example
     *
     * response.status(110, [4]); // will send: '110 4 databases present - text follows'
     * response.status(150, [3]); // will send: '150 3 definitions retrieved - text follows'
     * response.status(151, [{
     * 	HEADWORD: 'word',
     * 	DICTNAME: 'dictionary',
     * 	DICTDESC: 'Dictionary Name'
     * }]); // will send: '151 "word" dictionary "Dictionary Name"'
     *
     * @param {string?} message - The message to send instead of the default
     * "definitions retrieved - text follows".
     * @example
     *
     * response.status(110, [3], 'definition blocks found:'); // will send: '110 3 definitions blocks found:'
     *
     * @see [RFC 2229, section 7](https://www.rfc-editor.org/rfc/rfc2229#section-7)
     */
    status<K extends keyof StatusMap>(code: number, params?: Parameters<StatusMap[K]>, message?: string): this;
    /**
     * Writes a raw string. Calls the superclass method {@link Socket.write()}.
     *
     * **NOTE: THIS METHOD DOES NOT RETURN THE `this` OBJECT AND, THUS,
     * CANNOT BE CHAINED - MAKE SURE TO CALL IT ON ITS OWN OR AT THE END
     * OF A METHOD CHAIN.**
     *
     * @param {string} data - The string to be sent.
     * @returns Whether or not the whole string was successfully sent to kernel buffer
     * (see {@link Socket.write()}).
     *
     * @see {@link Socket.write()}
     */
    write(data: string): boolean;
    write(data: string, cb: (error?: Error | null) => void): boolean;
    write(data: string, encoding: BufferEncoding): boolean;
    write(data: string, encoding: BufferEncoding, cb: (error?: Error | null) => void): boolean;
    /**
     * Sends status code 250 to the client, along with a text message ("ok" by default).
     *
     * @param message - The message to send instead of the default "ok".
     */
    ok(message?: string): this;
    /**
     * Sends an error status code (500 by default) to the client, along with a text
     * message for that code (which is selected automatically if not specified).
     *
     * @param {number} code - The error status code to be sent.
     * Should be specified in RFC 2229.
     *
     * @param {string?} message - The message to send instead of the default.
     *
     * @see [RFC 2229, section 7](https://www.rfc-editor.org/rfc/rfc2229#section-7)
     */
    error(code?: number, message?: string): this;
    /**
     * Closes the connection to the client. Use it with codes 421 or 221.
     *
     * @param {Function?} onClose - An optional callback that is invoked when the socket
     * is finished (see {@link Socket.end()}).
     */
    close(onClose?: () => unknown): this;
    /**
     * Sends a list of databases to the client.
     *
     * @param {DatabaseInfo[]} databases
     * An array of {@link DatabaseInfo} objects, representing databases to be presented.
     * If the array is empty, status code 554 is returned to the client.
     * @param {string} message - A message to be sent instead of
     * "databases present - text follows".
     * See {@link DictResponse.status()} for details.
     * @param {string} okMessage - A message to be sent at the end, along with code 250,
     * instead of "ok".
     */
    writeDatabases(databases: DatabaseInfo[], message?: string, okMessage?: string): this;
    /**
     * Sends definitions to the client.
     *
     * @param {DictDefinition[]} definitions - An array of {@link DictDefinition} objects,
     * representing definitions to be sent. If the array is empty, status code 552 is
     * returned to the client.
     *
     * @param {string?} message - A message to be sent instead of the default
     * "definitions retrieved - text follows". See {@link DictResponse.status()} for details.
     *
     * @param {string?} okMessage - A message to be sent at the end, along with code 250,
     * instead of the default "ok".
     */
    writeDefinitions(definitions: DictDefinition[], message?: string, okMessage?: string): this;
    /**
     * Writes the definition blocks:
     * ```plaintext
     * 151 "headword" dictionary "dictionaryDescription"
     * header: value
     *
     * text
     * .
     * ```
     *
     * @param {DictDefinition[]} definitions - An array of {@link DictDefinition} objects,
     * representing definitions to send.
     */
    writeDefinitionBlocks(definitions: DictDefinition[]): this;
    /**
     * Writes the match text:
     * ```plaintext
     * 152 N matches found - text follows
     * dictionaryA "match1"
     * dictionaryB "match2"
     * (etc.)
     * .
     * ```
     *
     * @param {MatchEntry[]} matches - An array of {@link MatchEntry} objects,
     * representing matches to send.
     */
    writeMatches(matches: MatchEntry[], message?: string, okMessage?: string): this;
    /**
     * @private The TCP socket used for sending responses.
     */
    private readonly __socket;
    /** Checks if it's safe to write to the socket */
    private isUsable;
    /** Internal safe write wrapper */
    private safeWrite;
}
