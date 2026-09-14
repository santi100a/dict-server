"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.lfToCrlf = void 0;
function lfToCrlf(input) {
    return input.replace(/\r\n/g, '\n') // normalize first
        .replace(/\n/g, '\r\n'); // re-expand
}
exports.lfToCrlf = lfToCrlf;
