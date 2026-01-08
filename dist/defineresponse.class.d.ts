import { DictResponse } from './response.class';
import { DictDefinition } from './lib/libtypes';
export interface DefineResponse {
    writeDefinitions(definitions: DictDefinition[], message?: string, okMessage?: string): this;
    writeDefinitionBlocks(definitions: DictDefinition[]): this;
}
export declare function decorateDefineResponse(res: DictResponse): DictResponse & DefineResponse;
