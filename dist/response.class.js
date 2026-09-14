"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DictResponse = void 0;
var assertion_lib_1 = require("@santi100a/assertion-lib");
var DictResponse = /** @class */ (function () {
    function DictResponse(__socket, __hostname, __capabilities, __statusCodes, __errorHandlers, __generateMessageId, __generateWelcome) {
        this.__socket = __socket;
        this.__hostname = __hostname;
        this.__capabilities = __capabilities;
        this.__statusCodes = __statusCodes;
        this.__errorHandlers = __errorHandlers;
        this.__generateMessageId = __generateMessageId;
        this.__generateWelcome = __generateWelcome;
        this.lastCommand = null;
        this.initialized = false;
        this.authenticated = false;
        this.optionMime = false;
        this.messageId = '';
        this.clientName = '';
    }
    DictResponse.prototype.write = function (input, cbOrEncoding, cb) {
        if (typeof input !== 'string')
            (0, assertion_lib_1.assertInstanceOf)(input, Uint8Array, 'input');
        if (typeof cbOrEncoding !== 'function') {
            (0, assertion_lib_1.assertTypeOf)(cbOrEncoding, 'string', 'encoding');
            this.__socket.write(input, cbOrEncoding, cb);
        }
        else {
            this.__socket.write(input, cb);
        }
        return this;
    };
    DictResponse.prototype.initialize = function () {
        if (this.initialized)
            return this;
        this.initialized = true;
        if (this.__onInit)
            this.__onInit(this);
        return this;
    };
    DictResponse.prototype.onInit = function (initializer) {
        (0, assertion_lib_1.assertTypeOf)(initializer, 'function', 'initializer');
        this.__onInit = initializer;
    };
    DictResponse.prototype.writeln = function (input) {
        (0, assertion_lib_1.assertTypeOf)(input, 'string', 'input');
        this.write(input.concat('\r\n'));
        return this;
    };
    DictResponse.prototype.writeMultiline = function (input) {
        (0, assertion_lib_1.assertTypeOf)(input, 'string', 'input');
        var lines = input.split(/\r?\n/);
        for (var _i = 0, lines_1 = lines; _i < lines_1.length; _i++) {
            var line = lines_1[_i];
            if (line.startsWith('.')) {
                this.writeln(".".concat(line));
            }
            else {
                this.writeln(line);
            }
        }
        return this.writeln('.');
    };
    DictResponse.prototype.writeDefinitions = function (definitions) {
        (0, assertion_lib_1.assertArray)(definitions, 'definitions');
        this.status(150, definitions.length, this.__statusCodes[150]);
        for (var _i = 0, definitions_1 = definitions; _i < definitions_1.length; _i++) {
            var definition = definitions_1[_i];
            this.status(151, "".concat(definition.headword), definition.dictionary, "{definition.dictionaryDescription}");
            this.writeMultiline(definition.definition);
        }
        this.status(250);
    };
    DictResponse.prototype.error = function (code, message) {
        var _this = this;
        (0, assertion_lib_1.assertTypeOf)(code, 'number', 'code');
        var errorHandler = this.__errorHandlers[code];
        if (message !== undefined) {
            (0, assertion_lib_1.assertTypeOf)(message, 'string', 'message');
            this.status(code, message);
            var modified = structuredClone(this);
            modified.write = function () { return _this; };
            // Call error handler and suppress writes
            errorHandler(code, this.lastCommand, modified);
        }
        else if (errorHandler) {
            errorHandler(code, this.lastCommand, this);
            return this;
        }
        return this.status(code);
    };
    DictResponse.prototype.status = function (code) {
        var params = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            params[_i - 1] = arguments[_i];
        }
        (0, assertion_lib_1.assertTypeOf)(code, 'number', 'code');
        for (var _a = 0, params_1 = params; _a < params_1.length; _a++) {
            var param = params_1[_a];
            (0, assertion_lib_1.assertOneOfTypes)(param, ['string', 'number'], 'param');
        }
        if (params.length > 0)
            return this.writeln("".concat(code, " ").concat(params.join(' ')));
        var defaultText = this.__statusCodes[String(code)];
        return this.writeln(String(code).concat(defaultText ? ' '.concat(defaultText) : ''));
    };
    DictResponse.prototype.enableMime = function () {
        this.optionMime = true;
    };
    DictResponse.prototype.end = function (cb) {
        if (cb)
            (0, assertion_lib_1.assertTypeOf)(cb, 'function', 'cb');
        return this.__socket.end(cb);
    };
    DictResponse.prototype.__onInit = function (response) {
        var tokens = ['220', this.__hostname];
        var welcomeMessage = this.__generateWelcome();
        this.messageId = this.__generateMessageId();
        if (welcomeMessage)
            tokens.push(welcomeMessage);
        tokens.push("<".concat(this.__capabilities.join('.'), ">"), this.messageId);
        response.writeln(tokens.join(' '));
    };
    return DictResponse;
}());
exports.DictResponse = DictResponse;
