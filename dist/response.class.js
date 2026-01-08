"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
exports.__esModule = true;
exports.DictResponse = void 0;
var assertDefined = require("@santi100a/assertion-lib/cjs/defined");
var assertInstanceOf = require("@santi100a/assertion-lib/cjs/instance-of");
var assertTypeOf = require("@santi100a/assertion-lib/cjs/type-of");
var node_net_1 = require("node:net");
var libdotstuff_1 = require("./lib/libdotstuff");
var liblftocrlf_1 = require("./lib/liblftocrlf");
var libsanitize_1 = require("./lib/libsanitize");
var libstatuscodes_1 = require("./lib/libstatuscodes");
/**
 * Utility class for responses from the DICT server.
 * All methods of this class can be chained, except for `write()`.
 */
var DictResponse = /** @class */ (function (_super) {
    __extends(DictResponse, _super);
    function DictResponse(socket) {
        var _this = _super.call(this) || this;
        /** @readonly Whether or not MIME headers are enabled by the `OPTION MIME` command. */
        _this.optionMimeEnabled = false;
        /** @readonly The text specified in the `CLIENT` command. */
        _this.clientText = '';
        _this.__socket = socket;
        // Set __socket BEFORE changing prototype
        Object.defineProperty(socket, '__socket', {
            value: socket,
            writable: false,
            enumerable: false,
            configurable: false
        });
        // Now change the prototype
        Object.setPrototypeOf(socket, DictResponse.prototype);
        // Return the modified socket
        return socket;
    }
    /**
     * Writes a string as an RFC 5322 internet message (i.e. headers, text,
     * and `<CRLF>.<CRLF>`).
     *
     * @param {string} message - The raw text body of the message.
     * @param {Record} headers - The headers to be added before the message.
     */
    DictResponse.prototype.writeMessage = function (message, headers) {
        if (headers === void 0) { headers = {}; }
        for (var _i = 0, _a = Object.entries(headers); _i < _a.length; _i++) {
            var _b = _a[_i], key = _b[0], value = _b[1];
            this.writeLine("".concat(key, ": ").concat(value));
        }
        if (Object.entries(headers).length > 0)
            this.writeLine();
        for (var _c = 0, _d = (0, libdotstuff_1.dotStuff)((0, liblftocrlf_1.lfToCrlf)(message)).split('\r\n'); _c < _d.length; _c++) {
            var line = _d[_c];
            this.writeLine(line);
        }
        this.writeLine('.');
        return this;
    };
    /**
     * Writes a line of text and appends `<CRLF>` at the end.
     *
     * @param {string} line - The line to be written. Shouldn't include CR or LF.
     */
    DictResponse.prototype.writeLine = function (line) {
        if (line === void 0) { line = ''; }
        this.write((0, libsanitize_1.sanitize)(line) + '\r\n');
        return this;
    };
    /**
     *
     * @param {number} code - The status code to be set.
     * Should be specified in [RFC 2229](https://www.rfc-editor.org/rfc/rfc2229#section-7).
     * @param params - Parameters to be specified for the status code:
     * @example
     *
     * response.status(110, [4]); // will send: '110 4 databases present - text follows'
     * response.status(150, [3]); // will send: '150 3 definitions retrieved - text follows'
     * response.status(151, [{
     * 	HEADWORD: 'word',
     * 	DICTNAME: 'dictionary',
     * 	DICTDESC: 'Dictionary Name'
     * }]); // will send: '151 "word" dictionary "Dictionary Name"'
     *
     * @param {string?} message - The message to send instead of the default
     * "definitions retrieved - text follows".
     * @example
     *
     * response.status(110, [3], 'definition blocks found:'); // will send: '110 3 definitions blocks found:'
     *
     * @see [RFC 2229, section 7](https://www.rfc-editor.org/rfc/rfc2229#section-7)
     */
    DictResponse.prototype.status = function (code, params, message) {
        if (params === void 0) { params = []; }
        if (message === void 0) { message = libstatuscodes_1.statusText.apply(void 0, __spreadArray([code], params, false)); }
        return this.writeLine("".concat(code, " ").concat(message));
    };
    DictResponse.prototype.write = function (data, encodingOrCallback, cb) {
        if (typeof encodingOrCallback === 'function')
            return _super.prototype.write.call(this, data, cb);
        return _super.prototype.write.call(this, data, encodingOrCallback, cb);
    };
    /**
     * Sends status code 250 to the client, along with a text message ("ok" by default).
     *
     * @param message - The message to send instead of the default "ok".
     */
    DictResponse.prototype.ok = function (message) {
        return message ? this.status(250, [], message) : this.status(250);
    };
    /**
     * Sends an error status code (500 by default) to the client, along with a text
     * message for that code (which is selected automatically if not specified).
     *
     * @param {number} code - The error status code to be sent.
     * Should be specified in RFC 2229.
     *
     * @param {string?} message - The message to send instead of the default.
     *
     * @see [RFC 2229, section 7](https://www.rfc-editor.org/rfc/rfc2229#section-7)
     */
    DictResponse.prototype.error = function (code, message) {
        if (code === void 0) { code = 500; }
        return message ? this.status(code, [], message) : this.status(code);
    };
    /**
     * Closes the connection to the client. Use it with codes 421 or 221.
     *
     * @param {Function?} onClose - An optional callback that is invoked when the socket
     * is finished (see {@link Socket.end()}).
     */
    DictResponse.prototype.close = function (onClose) {
        if (onClose === void 0) { onClose = function () { }; }
        this.end(onClose);
        return this;
    };
    /**
     * Sends a list of databases to the client.
     *
     * @param {DatabaseInfo[]} databases
     * An array of {@link DatabaseInfo} objects, representing databases to be presented.
     * If the array is empty, status code 554 is returned to the client.
     * @param {string} message - A message to be sent instead of
     * "databases present - text follows".
     * See {@link DictResponse.status()} for details.
     * @param {string} okMessage - A message to be sent at the end, along with code 250,
     * instead of "ok".
     */
    DictResponse.prototype.writeDatabases = function (databases, message, okMessage) {
        if (message === void 0) { message = 'databases present - text follows'; }
        if (okMessage === void 0) { okMessage = 'ok'; }
        assertInstanceOf(databases, Array, 'databases');
        assertTypeOf(message, 'string', 'message');
        assertTypeOf(okMessage, 'string', 'okMessage');
        if (databases.length > 0) {
            this.status(110, [], message
                ? String(databases.length).concat(' ', message)
                : (0, libstatuscodes_1.statusText)(110, databases.length))
                .writeMessage(databases
                .map(function (_a) {
                var name = _a.name, description = _a.description;
                return "".concat(name, " \"").concat(description, "\"");
            })
                .join('\r\n'))
                .ok(okMessage);
            return this;
        }
        return this.status(554);
    };
    /**
     * Sends definitions to the client.
     *
     * @param {DictDefinition[]} definitions - An array of {@link DictDefinition} objects,
     * representing definitions to be sent. If the array is empty, status code 552 is
     * returned to the client.
     *
     * @param {string?} message - A message to be sent instead of the default
     * "definitions retrieved - text follows". See {@link DictResponse.status()} for details.
     *
     * @param {string?} okMessage - A message to be sent at the end, along with code 250,
     * instead of the default "ok".
     */
    DictResponse.prototype.writeDefinitions = function (definitions, message, okMessage) {
        if (okMessage === void 0) { okMessage = 'ok'; }
        assertInstanceOf(definitions, Array, 'definitions');
        if (message)
            assertTypeOf(message, 'string', 'message');
        assertTypeOf(okMessage, 'string', 'okMessage');
        if (definitions.length > 0) {
            this.status(150, [], "".concat(message
                ? String(definitions.length).concat(' ', message)
                : (0, libstatuscodes_1.statusText)(150, definitions.length)));
            this.writeDefinitionBlocks(definitions);
            return this.ok(okMessage);
        }
        return this.error(552);
    };
    /**
     * Writes the definition blocks:
     * ```plaintext
     * 151 "headword" dictionary "dictionaryDescription"
     * header: value
     *
     * text
     * .
     * ```
     *
     * @param {DictDefinition[]} definitions - An array of {@link DictDefinition} objects,
     * representing definitions to send.
     */
    DictResponse.prototype.writeDefinitionBlocks = function (definitions) {
        assertInstanceOf(definitions, Array, 'definitions');
        for (var _i = 0, definitions_1 = definitions; _i < definitions_1.length; _i++) {
            var _a = definitions_1[_i], headword = _a.headword, dictionary = _a.dictionary, dictionaryDescription = _a.dictionaryDescription, definition = _a.definition, mimeHeaders = _a.mimeHeaders;
            assertTypeOf(headword, 'string', 'headword');
            assertTypeOf(dictionary, 'string', 'dictionary');
            assertTypeOf(dictionaryDescription, 'string', 'dictionaryDescription');
            assertTypeOf(definition, 'string', 'definition');
            assertDefined(mimeHeaders, 'mimeHeaders');
            this.status(151, [
                {
                    HEADWORD: (0, libsanitize_1.sanitize)((0, liblftocrlf_1.lfToCrlf)(headword)),
                    DICTNAME: (0, libsanitize_1.sanitize)((0, liblftocrlf_1.lfToCrlf)(dictionary)),
                    DICTDESC: (0, libsanitize_1.sanitize)((0, liblftocrlf_1.lfToCrlf)(dictionaryDescription))
                }
            ]);
            this.writeMessage(definition, mimeHeaders);
        }
        return this;
    };
    /**
     * Writes the match text:
     * ```plaintext
     * 152 N matches found - text follows
     * dictionaryA "match1"
     * dictionaryB "match2"
     * (etc.)
     * .
     * ```
     *
     * @param {MatchEntry[]} matches - An array of {@link MatchEntry} objects,
     * representing matches to send.
     */
    DictResponse.prototype.writeMatches = function (matches, message, okMessage) {
        if (message === void 0) { message = 'matches found - text follows'; }
        if (okMessage === void 0) { okMessage = 'ok'; }
        assertInstanceOf(matches, Array, 'matches');
        assertTypeOf(message, 'string', 'message');
        assertTypeOf(okMessage, 'string', 'okMessage');
        this.status(152, [matches.length], "".concat(message
            ? String(matches.length).concat(' ', message)
            : (0, libstatuscodes_1.statusText)(152, matches.length)));
        this.writeMessage(matches
            .map(function (_a) {
            var word = _a.word, dictionary = _a.dictionary;
            return "".concat(dictionary, " \"").concat(word, "\"");
        })
            .join('\r\n'));
        this.ok(okMessage);
        return this;
    };
    return DictResponse;
}(node_net_1.Socket));
exports.DictResponse = DictResponse;
