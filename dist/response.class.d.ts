/// <reference types="node" />
/// <reference types="node" />
import { type Socket } from 'node:net';
import { ErrorHandler, DictCommand, DictDefinition } from './lib/libtypes';
export declare class DictResponse {
    private readonly __socket;
    private readonly __hostname;
    private readonly __capabilities;
    private readonly __statusCodes;
    private readonly __errorHandlers;
    private readonly __generateMessageId;
    private readonly __generateWelcome;
    lastCommand: DictCommand | null;
    initialized: boolean;
    authenticated: boolean;
    optionMime: boolean;
    messageId: string;
    clientName: string;
    constructor(__socket: Socket, __hostname: string, __capabilities: string[], __statusCodes: Record<number | string, string>, __errorHandlers: Record<string, ErrorHandler>, __generateMessageId: () => string, __generateWelcome: () => string);
    write(buffer: Uint8Array | string, cb?: (err?: Error | null) => void): DictResponse;
    write(str: Uint8Array | string, encoding?: BufferEncoding, cb?: (err?: Error | null) => void): DictResponse;
    initialize(): this;
    onInit<T = unknown>(initializer: (response: DictResponse) => T): void;
    writeln(input: string): this;
    writeMultiline(input: string): this;
    writeDefinitions(definitions: DictDefinition[]): void;
    error(code: number): DictResponse;
    error(code: number, message: string): DictResponse;
    status(code: number, ...params: (string | number)[]): this;
    enableMime(): void;
    end(cb?: () => void): Socket;
    private __onInit;
}
