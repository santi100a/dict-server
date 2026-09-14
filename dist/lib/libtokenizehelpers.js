"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isWhitespace = exports.isOpeningQuote = exports.handleQuotedChar = void 0;
function handleQuotedChar(char, quote, current) {
    if (quote) {
        if (char === quote) {
            return { quote: null, current: current };
        }
        return { quote: quote, current: current + char };
    }
    return { quote: quote, current: current };
}
exports.handleQuotedChar = handleQuotedChar;
function isOpeningQuote(char) {
    return ['"', "'"].includes(char);
}
exports.isOpeningQuote = isOpeningQuote;
function isWhitespace(char) {
    return /\s/.test(char);
}
exports.isWhitespace = isWhitespace;
