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
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DictServer = void 0;
var assertion_lib_1 = require("@santi100a/assertion-lib");
var node_crypto_1 = require("node:crypto");
var node_net_1 = require("node:net");
var libparsecommand_1 = require("./lib/libparsecommand");
var libreadline_1 = require("./lib/libreadline");
var libstatusmessages_1 = require("./lib/libstatusmessages");
var response_class_1 = require("./response.class");
var DictServer = /** @class */ (function (_super) {
    __extends(DictServer, _super);
    function DictServer(config) {
        var _this = this;
        var _a, _b, _c;
        (0, assertion_lib_1.assertInstanceOf)(config, Object, 'config');
        _this = _super.call(this) || this;
        _this.config = config;
        _this.statusMessages = (_a = _this.config.statusMessages) !== null && _a !== void 0 ? _a : libstatusmessages_1.STATUS_MESSAGES;
        _this.maxDictConnections = (_b = _this.config.connectionLimit) !== null && _b !== void 0 ? _b : 100;
        _this.idleDelay = (_c = _this.config.idleDelay) !== null && _c !== void 0 ? _c : 120000;
        _this.__connections = [];
        _this.__commandHandlers = {
            QUIT: function (_, response) { return response.status(221).end(); },
            DEFINE: function (_, response) { return response.error(502); },
            MATCH: function (_, response) { return response.error(502); },
            CLIENT: function (command, response) {
                response.clientName = command.parameters.join(' ');
                response.status(250);
            },
            STATUS: function (_, response) { return response.status(210); },
            HELP: function (_, response) {
                var _a;
                return response
                    .status(113)
                    .writeMultiline((_a = _this.config.helpText) !== null && _a !== void 0 ? _a : '')
                    .status(250);
            },
            AUTH: function (_, response) { return response.error(502); },
            SASLAUTH: function (_, response) { return response.error(502); },
            SASLRESP: function (_, response) { return response.error(502); },
            'SHOW DATABASES': function (_, response) {
                var databases = _this.config.databases;
                var availableDatabases = Object.entries(databases).filter(function (db) {
                    return !db[1].authRequired || (db[1].authRequired && response.authenticated);
                });
                if (availableDatabases.length === 0)
                    return response.error(554);
                response.status(110, availableDatabases.length, _this.statusMessages[110]);
                for (var _i = 0, availableDatabases_1 = availableDatabases; _i < availableDatabases_1.length; _i++) {
                    var database = availableDatabases_1[_i];
                    response.writeln("".concat(database[0], " \"").concat(database[1].description, "\""));
                }
                response.writeln('.').status(250);
            },
            'SHOW STRATEGIES': function (_, response) {
                var strategies = _this.config.strategies;
                if (!strategies || strategies.length === 0)
                    return response.error(555);
                response.status(111, strategies.length, _this.statusMessages[111]);
                for (var _i = 0, strategies_1 = strategies; _i < strategies_1.length; _i++) {
                    var strategy = strategies_1[_i];
                    response.writeln("".concat(strategy.name, " \"").concat(strategy.description, "\""));
                }
                response.writeln('.');
                response.status(250);
            },
            'SHOW INFO': function (command, response) {
                var _a, _b, _c;
                var info = (_c = (_a = _this.config.databases) === null || _a === void 0 ? void 0 : _a[(_b = command.parameters) === null || _b === void 0 ? void 0 : _b[0]]) === null || _c === void 0 ? void 0 : _c.infoText;
                response.status(112);
                response.writeMultiline(info !== null && info !== void 0 ? info : '');
                response.status(250);
            },
            'SHOW SERVER': function (_, response) {
                var info = _this.config.infoText;
                response.status(114);
                response.writeMultiline(info !== null && info !== void 0 ? info : '');
                response.status(250);
            },
            'OPTION MIME': function (_, response) {
                response.enableMime();
                response.status(250, '- MIME enabled');
            }
        };
        _this.__errorHandlers = {};
        _this.__interceptors = [];
        _this.on('connection', _this.__handler);
        return _this;
    }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    DictServer.prototype.__connectionFilter = function (_) {
        return {
            canConnect: true,
            statusCode: 220,
            statusMessage: this.statusMessages[220]
        };
    };
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    DictServer.prototype.__onCommand = function (_) {
        // Nothing!
    };
    DictServer.prototype.__onConnection = function (response) {
        response.initialize();
    };
    DictServer.prototype.__generateWelcome = function () {
        return this.config.welcomeText;
    };
    DictServer.prototype.__generateMessageId = function () {
        return "<".concat(Date.now(), ".").concat((0, node_crypto_1.randomBytes)(8).toString('hex'), "@").concat(this.config.hostname, ">");
    };
    DictServer.prototype.__handler = function (socket) {
        var _a, _b, _c, _d;
        return __awaiter(this, void 0, void 0, function () {
            var response, filterResult, lineReader, line, command, commandHandler;
            var _this = this;
            return __generator(this, function (_e) {
                switch (_e.label) {
                    case 0:
                        (0, assertion_lib_1.assertInstanceOf)(socket, node_net_1.Socket, 'socket');
                        response = new response_class_1.DictResponse(socket, (_a = this.config.hostname) !== null && _a !== void 0 ? _a : '', (_b = this.config.capabilities) !== null && _b !== void 0 ? _b : [], this.statusMessages, this.__errorHandlers, 
                        // Use arrow syntax to bind callback context to this server
                        function () { return _this.__generateMessageId(); }, function () { var _a; return (_a = _this.__generateWelcome()) !== null && _a !== void 0 ? _a : ''; });
                        if (this.__connections.length >= this.maxDictConnections)
                            return [2 /*return*/, response.status(420).end()];
                        this.__connections.push(socket);
                        socket.setTimeout(this.idleDelay);
                        // Remove the socket from the array when it closes
                        socket.once('close', function () {
                            var index = _this.__connections.indexOf(socket);
                            if (index !== -1) {
                                _this.__connections.splice(index, 1);
                            }
                        });
                        socket.on('timeout', function () {
                            socket.end();
                        });
                        filterResult = this.__connectionFilter(socket);
                        lineReader = (0, libreadline_1.createLineReader)(socket);
                        if (!filterResult.canConnect)
                            return [2 /*return*/, response
                                    .status(filterResult.statusCode, filterResult.statusMessage)
                                    .end()];
                        this.__onConnection(response);
                        _e.label = 1;
                    case 1:
                        if (!true) return [3 /*break*/, 3];
                        return [4 /*yield*/, lineReader()];
                    case 2:
                        line = _e.sent();
                        if (line === null)
                            return [2 /*return*/]; // Socket ended
                        command = (0, libparsecommand_1.parseCommand)(line);
                        response.lastCommand = command;
                        (_d = (_c = this.__interceptors)[0]) === null || _d === void 0 ? void 0 : _d.call(_c, command, response, this.__interceptors[1]);
                        this.__onCommand(command);
                        commandHandler = this.__commandHandlers[command.name];
                        if (!commandHandler) {
                            response.error(500);
                            return [3 /*break*/, 1];
                        }
                        commandHandler(command, response);
                        return [3 /*break*/, 1];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    // STANDARD COMMANDS
    DictServer.prototype.define = function (handler) {
        return this.commandHandler('DEFINE', handler);
    };
    DictServer.prototype.match = function (handler) {
        return this.commandHandler('MATCH', handler);
    };
    DictServer.prototype.showDatabases = function (handler) {
        return this.commandHandler('SHOW DATABASES', handler);
    };
    DictServer.prototype.showStrategies = function (handler) {
        return this.commandHandler('SHOW STRATEGIES', handler);
    };
    DictServer.prototype.showInfo = function (handler) {
        return this.commandHandler('SHOW INFO', handler);
    };
    DictServer.prototype.showServer = function (handler) {
        return this.commandHandler('SHOW SERVER', handler);
    };
    DictServer.prototype.client = function (handler) {
        return this.commandHandler('CLIENT', handler);
    };
    DictServer.prototype.status = function (handler) {
        return this.commandHandler('STATUS', handler);
    };
    DictServer.prototype.help = function (handler) {
        return this.commandHandler('HELP', handler);
    };
    DictServer.prototype.quit = function (handler) {
        return this.commandHandler('QUIT', handler);
    };
    DictServer.prototype.optionMime = function (handler) {
        return this.commandHandler('OPTION MIME', handler);
    };
    DictServer.prototype.auth = function (handler) {
        return this.commandHandler('AUTH', handler);
    };
    DictServer.prototype.saslAuth = function (handler) {
        return this.commandHandler('SASLAUTH', handler);
    };
    DictServer.prototype.saslResp = function (handler) {
        return this.commandHandler('SASLRESP', handler);
    };
    DictServer.prototype.use = function (interceptor) {
        (0, assertion_lib_1.assertTypeOf)(interceptor, 'function', 'interceptor');
        this.__interceptors.push(interceptor);
    };
    DictServer.prototype.setErrorHandler = function (code, handler) {
        (0, assertion_lib_1.assertTypeOf)(code, 'number', 'code');
        (0, assertion_lib_1.assertTypeOf)(handler, 'function', 'handler');
        this.__errorHandlers[code] = handler;
    };
    DictServer.prototype.setConnectionFilter = function (filter) {
        (0, assertion_lib_1.assertTypeOf)(filter, 'function', 'filter');
        this.__connectionFilter = filter;
    };
    DictServer.prototype.setWelcomeGenerator = function (generator) {
        (0, assertion_lib_1.assertTypeOf)(generator, 'function', 'generator');
        this.__generateWelcome = generator;
    };
    DictServer.prototype.setStatusCodes = function (statusCodes) {
        (0, assertion_lib_1.assertInstanceOf)(statusCodes, Object, 'statusCodes');
        this.statusMessages = statusCodes;
    };
    DictServer.prototype.addStatusCode = function (code, text) {
        var _a;
        (0, assertion_lib_1.assertTypeOf)(code, 'number', 'code');
        (0, assertion_lib_1.assertTypeOf)(text, 'string', 'text');
        this.statusMessages = __assign(__assign({}, this.statusMessages), (_a = {}, _a[code] = text, _a));
    };
    DictServer.prototype.addStatusCodes = function (codes) {
        (0, assertion_lib_1.assertInstanceOf)(codes, Object, 'codes');
        this.statusMessages = __assign(__assign({}, this.statusMessages), codes);
    };
    DictServer.prototype.onCommand = function (handler) {
        (0, assertion_lib_1.assertTypeOf)(handler, 'function', 'handler');
        this.__onCommand = handler;
    };
    DictServer.prototype.commandHandler = function (command, handler) {
        (0, assertion_lib_1.assertTypeOf)(command, 'string', 'command');
        (0, assertion_lib_1.assertTypeOf)(handler, 'function', 'handler');
        this.__commandHandlers[command.toUpperCase()] = handler;
    };
    DictServer.prototype.onConnection = function (handler) {
        (0, assertion_lib_1.assertTypeOf)(handler, 'function', 'handler');
        this.__onConnection = handler;
    };
    DictServer.prototype.shutdown = function () {
        this.close();
        this.__connections.forEach(function (connection) {
            try {
                connection.destroy();
            }
            catch (_a) { }
        });
    };
    return DictServer;
}(node_net_1.Server));
exports.DictServer = DictServer;
