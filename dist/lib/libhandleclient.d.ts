/// <reference types="node" />
import type { Socket } from 'node:net';
import type { DictResponse } from '../response.class';
import type { DictCommand } from './libtypes';
export declare function handleClient(socket: Socket, onCommand: (cmd: DictCommand, res: DictResponse) => unknown, response: DictResponse): Promise<void>;
