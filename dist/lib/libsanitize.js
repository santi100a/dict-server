"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sanitize = void 0;
function sanitize(input) {
    // Remove CR and LF characters
    return input.replace(/[\r\n]/g, '');
}
exports.sanitize = sanitize;
