"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.dotStuff = void 0;
function dotStuff(input) {
    // Replace <CRLF>.<CRLF>
    return input.replace(/(^|\r\n)\./g, '$1..');
}
exports.dotStuff = dotStuff;
