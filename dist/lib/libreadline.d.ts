/// <reference types="node" />
import type { Socket } from 'node:net';
export declare function createLineReader(socket: Socket): () => Promise<string | null>;
