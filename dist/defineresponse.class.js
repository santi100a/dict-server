"use strict";
exports.__esModule = true;
exports.decorateDefineResponse = void 0;
var liblftocrlf_1 = require("./lib/liblftocrlf");
var libsanitize_1 = require("./lib/libsanitize");
var libstatuscodes_1 = require("./lib/libstatuscodes");
function decorateDefineResponse(res) {
    var r = res;
    r.writeDefinitions = function (definitions, message, okMessage) {
        if (okMessage === void 0) { okMessage = 'ok'; }
        this.status(150, [], "".concat(message ? String(definitions.length).concat(' ', message) : (0, libstatuscodes_1.statusText)(150, definitions.length)));
        this.writeDefinitionBlocks(definitions);
        this.ok(okMessage);
        return this;
    };
    r.writeDefinitionBlocks = function (definitions) {
        for (var _i = 0, definitions_1 = definitions; _i < definitions_1.length; _i++) {
            var _a = definitions_1[_i], headword = _a.headword, dictionary = _a.dictionary, dictionaryDescription = _a.dictionaryDescription, definition = _a.definition;
            this.status(151, [
                {
                    HEADWORD: (0, libsanitize_1.sanitize)((0, liblftocrlf_1.lfToCrlf)(headword)),
                    DICTNAME: (0, libsanitize_1.sanitize)((0, liblftocrlf_1.lfToCrlf)(dictionary)),
                    DICTDESC: (0, libsanitize_1.sanitize)((0, liblftocrlf_1.lfToCrlf)(dictionaryDescription))
                }
            ]);
            this.writeMessage(definition);
        }
        return this;
    };
    return r;
}
exports.decorateDefineResponse = decorateDefineResponse;
