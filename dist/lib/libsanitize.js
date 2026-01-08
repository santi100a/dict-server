"use strict";
exports.__esModule = true;
exports.sanitize = void 0;
function sanitize(input) {
    // Remove CR and LF characters
    return input.replace(/[\r\n]/g, '');
}
exports.sanitize = sanitize;
