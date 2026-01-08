"use strict";
exports.__esModule = true;
exports.parseCommand = void 0;
var libtokenize_1 = require("./libtokenize");
var SHOW_MAP = {
    DB: 'DATABASES',
    DATABASES: 'DATABASES',
    STRAT: 'STRATEGIES',
    STRATEGIES: 'STRATEGIES',
    SERVER: 'SERVER',
    INFO: 'INFO'
};
function parseCommand(line) {
    var _a, _b;
    var raw = line;
    var parts = (0, libtokenize_1.tokenize)(raw.trim());
    var name = parts[0].toUpperCase();
    var parameters = parts.slice(1);
    var firstParameter = (_b = (_a = parameters[0]) === null || _a === void 0 ? void 0 : _a.toUpperCase()) !== null && _b !== void 0 ? _b : '';
    // SHOW normalization
    if (name === 'SHOW' &&
        Object.keys(SHOW_MAP).includes(firstParameter)) {
        var normalized = SHOW_MAP[firstParameter];
        if (normalized) {
            return {
                raw: raw,
                name: "SHOW ".concat(normalized),
                parameters: parameters.slice(1),
                syntaxValid: true
            };
        }
    }
    // OPTION normalization
    if (name === 'OPTION' && parameters[0] === 'MIME') {
        return {
            raw: raw,
            name: 'OPTION MIME',
            parameters: parameters.slice(1),
            syntaxValid: true
        };
    }
    return {
        raw: raw,
        name: name,
        parameters: parameters,
        syntaxValid: true
    };
}
exports.parseCommand = parseCommand;
