"use strict";
exports.__esModule = true;
exports.lfToCrlf = void 0;
function lfToCrlf(input) {
    return input.replace(/\r\n/g, '\n') // normalize first
        .replace(/\n/g, '\r\n'); // re-expand
}
exports.lfToCrlf = lfToCrlf;
