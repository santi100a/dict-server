import { DictResponse } from './response.class';
import type { DatabaseInfo } from './lib/libtypes';
export interface MatchResponse {
    writeDatabases(databases: DatabaseInfo[], message?: string, okMessage?: string): this;
    writeDefinitionBlocks(databases: DatabaseInfo[]): this;
}
export declare function decorateMatchResponse(res: DictResponse): DictResponse & MatchResponse;
