"use strict";
exports.__esModule = true;
exports.tokenize = void 0;
var libtokenizehelpers_1 = require("./libtokenizehelpers");
function tokenize(line) {
    var tokens = [];
    var current = '';
    var quote = null;
    for (var _i = 0, _a = line.split(''); _i < _a.length; _i++) {
        var char = _a[_i];
        if (quote) {
            var result = (0, libtokenizehelpers_1.handleQuotedChar)(char, quote, current);
            quote = result.quote;
            current = result.current;
            continue;
        }
        if ((0, libtokenizehelpers_1.isOpeningQuote)(char)) {
            quote = char;
            continue;
        }
        if ((0, libtokenizehelpers_1.isWhitespace)(char)) {
            if (current.length > 0) {
                tokens.push(current);
                current = '';
            }
            continue;
        }
        current += char;
    }
    if (quote) {
        throw new Error('Unterminated quoted string');
    }
    if (current.length > 0) {
        tokens.push(current);
    }
    return tokens;
}
exports.tokenize = tokenize;
