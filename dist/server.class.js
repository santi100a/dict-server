"use strict";
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
exports.__esModule = true;
exports.DictServer = void 0;
var node_net_1 = require("node:net");
var response_class_1 = require("./response.class");
var libhandleclient_1 = require("./lib/libhandleclient");
var type_of_1 = require("@santi100a/assertion-lib/cjs/type-of");
var assertInstanceOf = require("@santi100a/assertion-lib/cjs/instance-of");
var range_1 = require("@santi100a/assertion-lib/cjs/range");
/**
 * The main class for implementing the DICT server.
 * All methods of this class can be chained, except for `shutdown()`.
 */
var DictServer = /** @class */ (function () {
    function DictServer() {
        var _this = this;
        // Public members
        /** @readonly Server banner welcome text. */
        this.welcomeText = 'welcome';
        /** @readonly Server capabilities. */
        this.capabilities = ['mime'];
        /** @readonly The message ID for the banner. */
        this.messageId = '12345.1234.1234567890@host.org';
        /** @readonly The available databases on the server. */
        this.databases = [];
        /** @readonly The available strategies on the server. */
        this.strategies = [];
        /** @readonly The info text for the server. */
        this.serverInfo = '';
        /** @readonly The info text for each database. */
        this.databaseInfo = {};
        /** @readonly The help text sent by the `HELP` command. */
        this.helpText = "DEFINE <database> <word>            -- look up word in database\n\tMATCH <database> <strategy> <word>  -- match word in database using strategy\nSHOW DB or SHOW DATABASES           -- list all accessible databases\nSHOW STRAT or SHOW STRATEGIES       -- list available matching strategies\nSHOW INFO <database>                -- provide information about the database\nSHOW SERVER                         -- provide site-specific information\nOPTION MIME                         -- use MIME headers\nCLIENT [info]                       -- identify client to server\nAUTH <user> <string>                -- provide authentication information\nSTATUS                              -- display status information\nHELP                                -- display this help information\nQUIT                                -- terminate connection";
        /** @readonly A set of `Socket` objects representing current connections. */
        this.sockets = new Set();
        /** @private The object containing all handlers for commands. */
        this.__handlers = {};
        this.__handlers = {
            DEFINE: function (_, response) { return response.error(502); },
            MATCH: function (_, response) { return response.error(502); },
            'SHOW DATABASES': function (_, response) {
                if (_this.databases.length > 0) {
                    response.writeDatabases(_this.databases);
                    return;
                }
                response.error(554);
            },
            'SHOW STRATEGIES': function (_, response) {
                if (_this.strategies.length > 0) {
                    response
                        .status(111, [_this.strategies.length])
                        .writeMessage(_this.strategies
                        .map(function (_a) {
                        var name = _a.name, description = _a.description;
                        return "".concat(name, " \"").concat(description, "\"");
                    })
                        .join('\r\n'))
                        .ok();
                    return;
                }
                response.error(555);
            },
            'SHOW INFO': function (command, response) {
                if (_this.databaseInfo[command.parameters[0]]) {
                    response
                        .status(112)
                        .writeMessage(_this.databaseInfo[command.parameters[0]])
                        .ok();
                    return;
                }
                response.error(550);
            },
            'SHOW SERVER': function (_, response) {
                response.status(114).writeMessage(_this.serverInfo).ok();
            },
            'OPTION MIME': function (_, response) {
                response.optionMimeEnabled = true;
                response.ok();
            },
            CLIENT: function (command, response) {
                response.clientText = command.parameters.join(' ');
                response.ok();
            },
            AUTH: function (_, response) { return response.error(502); },
            SASLAUTH: function (_, response) { return response.error(502); },
            STATUS: function (_, response) { return response.ok(); },
            HELP: function (_, response) {
                response.status(113).writeMessage(_this.helpText).ok();
            },
            QUIT: function (_, response) { return response.status(221, []).close(); },
            SHOW: function (_, response) { return response.error(501); },
            OPTION: function (_, response) { return response.error(501); }
        };
        this.__server = (0, node_net_1.createServer)(function (socket) {
            // Track sockets for clean shutdown
            _this.sockets.add(socket);
            socket.on('close', function () { return _this.sockets["delete"](socket); });
            var response = new response_class_1.DictResponse(socket);
            // CONNECT hook (once per connection)
            _this.__connectHandler(response);
            // Create a promise chain for serialization
            var processingChain = Promise.resolve();
            var serializedDispatch = function (command, res) {
                // Create a new promise that chains to the previous work
                var task = function () { return _this.__dispatch(command, res); };
                // Chain it (handle both success and failure paths)
                processingChain = processingChain.then(task, task);
                // Return the chain so handleClient actually waits
                return processingChain;
            };
            // ONE read loop
            (0, libhandleclient_1.handleClient)(socket, serializedDispatch, response)["catch"](function (err) {
                if (!socket.destroyed) {
                    socket.destroy();
                }
                if (process.env.NODE_ENV !== 'test') {
                    console.error(err);
                }
            });
        });
        // Cleanup leftover sockets when server closes
        this.__server.on('close', function () {
            // @ts-expect-error: ES2015
            for (var _i = 0, _a = _this.sockets; _i < _a.length; _i++) {
                var sock = _a[_i];
                if (!sock.destroyed)
                    sock.destroy();
            }
            _this.sockets.clear();
        });
    }
    // Commands
    /**
     * Sets a handler for the `DEFINE` command.
     *
     * **NOTE:** Multiple calls to `define()` will **NOT** register multiple handlers - they
     * will simply overwrite the previous one; thus, only the last call will register a
     * command handler.
     *
     * @param {CommandHandler} cb - The handler that will be called when the `DEFINE` command
     * is received. It will be called with a {@link DictCommand} and a {@link DictResponse}
     * object as arguments.
     */
    DictServer.prototype.define = function (cb) {
        (0, type_of_1.assertTypeOf)(cb, 'function', 'cb');
        return this.command('DEFINE', cb);
    };
    /**
     * Sets a handler for the `MATCH` command.
     *
     * **NOTE:** Multiple calls to `match()` will **NOT** register multiple handlers - they
     * will simply overwrite the previous one; thus, only the last call will register a
     * command handler.
     *
     * @param {CommandHandler} cb - The handler that will be called when the `MATCH` command
     * is received. It will be called with a {@link DictCommand} and a {@link DictResponse}
     * object as arguments.
     */
    DictServer.prototype.match = function (cb) {
        (0, type_of_1.assertTypeOf)(cb, 'function', 'cb');
        return this.command('MATCH', cb);
    };
    /**
     * Sets a handler for the `SHOW DB` or `SHOW DATABASES` commands.
     *
     * **NOTE:** Calling this function will override the default handler, which sends
     * the contents of {@link DictServer.databases} to the client. If you set a handler,
     * make sure to implement this behavior.
     *
     * Multiple calls to `showDatabases()` will **NOT** register multiple
     * handlers - they will simply overwrite the previous one; thus, only the last call
     * will register a command handler.
     *
     * @param {Function} cb - The handler that will be called when
     * the `SHOW DATABASES` command is received. It will be called with
     * a {@link DictResponse} object as an argument.
     */
    DictServer.prototype.showDatabases = function (cb) {
        (0, type_of_1.assertTypeOf)(cb, 'function', 'cb');
        return this.command('SHOW DB', function (_, response) { return cb(response); });
    };
    /**
     * Sets a handler for the `SHOW STRAT` or `SHOW STRATEGIES` commands.
     * **NOTE:** Calling this function will override the default handler, which sends
     * the contents of {@link DictServer.strategies} to the client. If you set a handler,
     * make sure to implement this behavior.
     *
     * Multiple calls to `showStrategies()` will **NOT** register multiple
     * handlers - they will simply overwrite the previous one; thus, only the last call
     * will register a command handler.
     *
     * @param {Function} cb - The handler that will be called when
     * the `SHOW STRATEGIES` command is received. It will be called with
     * a {@link DictResponse} object as an argument.
     */
    DictServer.prototype.showStrategies = function (cb) {
        (0, type_of_1.assertTypeOf)(cb, 'function', 'cb');
        return this.command('SHOW STRAT', function (_, response) { return cb(response); });
    };
    /**
     * Sets a handler for the `SHOW INFO` command.
     *
     * **NOTE:** Calling this function will override the default handler, which sends
     * the corresponding entry of {@link DictServer.databaseInfo} to the client.
     * If you set a handler, make sure to implement this behavior.
     *
     * Multiple calls to `showInfo()` will **NOT** register multiple
     * handlers - they will simply overwrite the previous one; thus, only the last call
     * will register a command handler.
     *
     * @param {CommandHandler} cb - The handler that will be called when the `SHOW INFO`
     * command is received. It will be called with a {@link DictCommand} and
     * a {@link DictResponse} object as arguments.
     */
    DictServer.prototype.showInfo = function (cb) {
        (0, type_of_1.assertTypeOf)(cb, 'function', 'cb');
        return this.command('SHOW INFO', cb);
    };
    /**
     * Sets a handler for the `SHOW SERVER` command.
     *
     * **NOTE:** Calling this function will override the default handler, which sends
     * the contents of {@link DictServer.serverInfo} to the client. If you set a handler,
     * make sure to implement this behavior.
     *
     * Multiple calls to `showServer()` will **NOT** register multiple
     * handlers - they will simply overwrite the previous one; thus, only the last call
     * will register a command handler.
     *
     * @param {CommandHandler} cb - The handler that will be called when the `SHOW SERVER`
     * command is received. It will be called with a {@link DictCommand} and
     * a {@link DictResponse} object as arguments.
     */
    DictServer.prototype.showServer = function (cb) {
        (0, type_of_1.assertTypeOf)(cb, 'function', 'cb');
        return this.command('SHOW SERVER', cb);
    };
    /**
     * Sets a handler for the `OPTION MIME` command.
     *
     * **NOTE:** Calling this function will override the default handler, which sets
     * {@link DictResponse.optionMimeEnabled} to `true` and sends status code 250 to
     * the client. If you set a handler, make sure to implement this behavior.
     *
     * Multiple calls to `optionMime()` will **NOT** register multiple
     * handlers - they will simply overwrite the previous one; thus, only the last call
     * will register a command handler.
     *
     * @param {CommandHandler} cb - The handler that will be called when the `OPTION MIME`
     * command is received. It will be called with a {@link DictCommand} and
     * a {@link DictResponse} object as arguments.
     */
    DictServer.prototype.optionMime = function (cb) {
        (0, type_of_1.assertTypeOf)(cb, 'function', 'cb');
        return this.command('OPTION MIME', cb);
    };
    /**
     * Sets a handler for the `SHOW` command, which gets called if the client sends
     * a `SHOW` command other than `SHOW DB`, `SHOW STRAT`, `SHOW DATABASES`,
     * `SHOW STRATEGIES`, `SHOW INFO` or `SHOW SERVER`.
     *
     * **NOTE:** Calling this function will override the default handler, which sends
     * status code 501 to the client.
     *
     * Multiple calls to `show()` will **NOT** register multiple
     * handlers - they will simply overwrite the previous one; thus, only the last call
     * will register a command handler.
     *
     * @param {CommandHandler} cb - The handler that will be called when the `SHOW`
     * command is received. It will be called with a {@link DictCommand} and
     * a {@link DictResponse} object as arguments.
     */
    DictServer.prototype.show = function (cb) {
        (0, type_of_1.assertTypeOf)(cb, 'function', 'cb');
        return this.command('SHOW', cb);
    };
    /**
     * Sets a handler for the `OPTION` command, which gets called if the client sends
     * an `OPTION` command other than `OPTION MIME`.
     *
     * **NOTE:** Calling this function will override the default handler, which sends
     * status code 501 to the client.
     *
     * Multiple calls to `option()` will **NOT** register multiple
     * handlers - they will simply overwrite the previous one; thus, only the last call
     * will register a command handler.
     *
     * @param {CommandHandler} cb - The handler that will be called when the `OPTION`
     * command is received. It will be called with a {@link DictCommand} and
     * a {@link DictResponse} object as arguments.
     */
    DictServer.prototype.option = function (cb) {
        (0, type_of_1.assertTypeOf)(cb, 'function', 'cb');
        return this.command('OPTION', cb);
    };
    /**
     * Sets a handler for the `CLIENT` command.
     *
     * **NOTE:** Calling this function will override the default handler, which sets
     * {@link DictResponse.clientText} to the client text sent in the command and
     * sends status code 250 to the client. If you set a handler, make sure to implement
     * this behavior.
     *
     * Multiple calls to `client()` will **NOT** register multiple
     * handlers - they will simply overwrite the previous one; thus, only the last call
     * will register a command handler.
     *
     * @param {CommandHandler} cb - The handler that will be called when the `CLIENT`
     * command is received. It will be called with a {@link DictCommand} and
     * a {@link DictResponse} object as arguments.
     */
    DictServer.prototype.client = function (cb) {
        (0, type_of_1.assertTypeOf)(cb, 'function', 'cb');
        return this.command('CLIENT', cb);
    };
    /**
     * Sets a handler for the `STATUS` command.
     *
     * **NOTE:** Calling this function will override the default handler, which sends
     * status code 250 to the client. If you set a handler, make sure to implement
     * this behavior.
     *
     * Multiple calls to `status()` will **NOT** register multiple
     * handlers - they will simply overwrite the previous one; thus, only the last call
     * will register a command handler.
     *
     * @param {CommandHandler} cb - The handler that will be called when the `STATUS`
     * command is received. It will be called with a {@link DictCommand} and
     * a {@link DictResponse} object as arguments.
     */
    DictServer.prototype.status = function (cb) {
        (0, type_of_1.assertTypeOf)(cb, 'function', 'cb');
        return this.command('STATUS', cb);
    };
    /**
     * Sets a handler for the `HELP` command.
     *
     * **NOTE:** Calling this function will override the default handler, which sends
     * the contents of {@link DictServer.helpText} to the client.
     * If you set a handler, make sure to implement this behavior.
     *
     * Multiple calls to `help()` will **NOT** register multiple
     * handlers - they will simply overwrite the previous one; thus, only the last call
     * will register a command handler.
     *
     * @param {CommandHandler} cb - The handler that will be called when the `HELP`
     * command is received. It will be called with a {@link DictCommand} and
     * a {@link DictResponse} object as arguments.
     */
    DictServer.prototype.help = function (cb) {
        (0, type_of_1.assertTypeOf)(cb, 'function', 'cb');
        return this.command('HELP', cb);
    };
    /**
     * Sets a handler for the `QUIT` command.
     *
     * **NOTE:** Calling this function will override the default handler, which sends
     * status code 221 to the client and closes the connection. If you set a handler,
     * make sure to implement this behavior.
     *
     * Multiple calls to `quit()` will **NOT** register multiple
     * handlers - they will simply overwrite the previous one; thus, only the last call
     * will register a command handler.
     *
     * @param {CommandHandler} cb - The handler that will be called when the `QUIT`
     * command is received. It will be called with a {@link DictCommand} and
     * a {@link DictResponse} object as arguments.
     */
    DictServer.prototype.quit = function (cb) {
        (0, type_of_1.assertTypeOf)(cb, 'function', 'cb');
        return this.command('QUIT', cb);
    };
    // Event handlers
    /**
     * Sets a handler for commands without an associated handler.
     *
     * **NOTE:** Calling this function will override the default handler, which sends
     * status code 500 to the client. If you set a handler, make sure to implement
     * this behavior.
     *
     * Multiple calls to `onUnknownCommand()` will **NOT** register multiple
     * handlers - they will simply overwrite the previous one; thus, only the last call
     * will register a command handler.
     *
     * @param {CommandHandler} cb - The handler that will be called when a command with
     * no handler is received. It will be called with a {@link DictCommand} and
     * a {@link DictResponse} object as arguments.
     */
    DictServer.prototype.onUnknownCommand = function (cb) {
        (0, type_of_1.assertTypeOf)(cb, 'function', 'cb');
        this.__unknownHandler = cb;
        return this;
    };
    /**
     * Sets a handler that gets called when any command is received.
     *
     * **NOTE:** Multiple calls to `onCommand()` will **NOT** register multiple
     * handlers - they will simply overwrite the previous one; thus, only the last call
     * will register a command handler.
     *
     * @param {CommandHandler} cb - The handler that will be called when a command is
     * received. It will be called with a {@link DictCommand} and a {@link DictResponse}
     * object as arguments.
     */
    DictServer.prototype.onCommand = function (cb) {
        (0, type_of_1.assertTypeOf)(cb, 'function', 'cb');
        this.__commandHandler = cb;
        return this;
    };
    /**
     * Sets a handler that is called when a syntax error is found (i.e. mismatched quotes).
     *
     * **NOTE:** Calling this function will override the default handler, which sends
     * status code 501 to the client. If you set a handler, make sure to implement
     * this behavior.
     *
     * Multiple calls to `onSyntaxError()` will **NOT** register multiple
     * handlers - they will simply overwrite the previous one; thus, only the last call
     * will register a command handler.
     *
     * @param {CommandHandler} cb - The handler that will be called when a syntax error
     * is detected. It will be called with a {@link DictCommand} and a {@link DictResponse}
     * object as arguments.
     */
    DictServer.prototype.onSyntaxError = function (cb) {
        (0, type_of_1.assertTypeOf)(cb, 'function', 'cb');
        this.__syntaxHandler = cb;
        return this;
    };
    /**
     * Sets a handler that is called when a client connects.
     *
     * **NOTE:** Calling this function will override the default handler, which sends
     * a welcome banner to the client:
     * ```plaintext
     * 220 {this.welcomeText} <{this.capabilities[0]}.{this.capabilities[1]}.{...}> <{this.messageId}>
     * ```
     * If you set a handler, make sure to implement this behavior.
     *
     * Multiple calls to `onConnect()` will **NOT** register multiple
     * handlers - they will simply overwrite the previous one; thus, only the last call
     * will register a command handler.
     *
     * @param {CommandHandler} cb - The handler that will be called when a command is
     * received. It will be called with a {@link DictResponse} object as an argument.
     */
    DictServer.prototype.onConnect = function (cb) {
        (0, type_of_1.assertTypeOf)(cb, 'function', 'cb');
        this.__connectHandler = cb;
        return this;
    };
    /**
     * Sets a handler that is called when another handler throws an error.
     *
     * **NOTE:** Calling this function will override the default handler, which sends
     * status code 420 to the client. If you set a handler, make sure to implement
     * this behavior.
     *
     * Multiple calls to `onSyntaxError()` will **NOT** register multiple
     * handlers - they will simply overwrite the previous one; thus, only the last call
     * will register a command handler.
     *
     * @param {CommandHandler} cb - The handler that will be called when a command is
     * received. It will be called with an {@link Error} and a {@link DictResponse}
     * object as arguments.
     */
    DictServer.prototype.onHandlerError = function (cb) {
        (0, type_of_1.assertTypeOf)(cb, 'function', 'cb');
        this.__handlerError = cb;
        return this;
    };
    // Setters
    /**
     * Sets the first part of the welcome banner sent to clients.
     * **NOTE:** Calling this function overwrites the previous welcome text.
     *
     * @param {string} welcomeText - The text to be sent first in the welcome banner.
     */
    DictServer.prototype.setWelcomeText = function (welcomeText) {
        (0, type_of_1.assertTypeOf)(welcomeText, 'string', 'welcomeText');
        this.welcomeText = welcomeText;
        return this;
    };
    /**
     * Sets the list of capabilities sent to clients.
     * **NOTE:** Calling this function overwrites the previous capabilities list.
     *
     * @param {string[]} capabilities - The capabilities to be sent in the welcome banner.
     */
    DictServer.prototype.setCapabilities = function () {
        var capabilities = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            capabilities[_i] = arguments[_i];
        }
        assertInstanceOf(capabilities, Array, 'capabilities');
        this.capabilities = capabilities;
        return this;
    };
    /**
     * Sets the message ID sent to clients.
     * **NOTE:** Calling this function overwrites the previous message ID.
     *
     * @param {string} messageId - The message ID to be sent in the welcome banner.
     */
    DictServer.prototype.setMessageId = function (messageId) {
        (0, type_of_1.assertTypeOf)(messageId, 'string', 'messageId');
        this.messageId = messageId;
        return this;
    };
    /**
     * Sets the list of strategies sent to clients.
     * **NOTE:** Calling this function overwrites the previous list of strategies.
     *
     * @param {StrategyInfo[]} strategies - The list of strategies to send
     * when clients send the `SHOW STRAT` command.
     */
    DictServer.prototype.setStrategies = function () {
        var strategies = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            strategies[_i] = arguments[_i];
        }
        assertInstanceOf(strategies, Array, 'strategies');
        this.strategies = strategies;
        return this;
    };
    /**
     * Sets the list of databases sent to clients.
     * **NOTE:** Calling this function overwrites the previous list of databases.
     *
     * @param {DatabaseInfo[]} databases - The list of databases to send
     * when clients send the `SHOW DB` command.
     */
    DictServer.prototype.setDatabases = function () {
        var databases = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            databases[_i] = arguments[_i];
        }
        assertInstanceOf(databases, Array, 'databases');
        this.databases = databases;
        return this;
    };
    /**
     * Sets the server information text sent in response to the `SHOW SERVER` command.
     * **NOTE:** Calling this function overwrites the previous server info text.
     *
     * @param {string} serverInfo - The info text to send when clients send the
     * `SHOW SERVER` command.
     */
    DictServer.prototype.setServerInfo = function (serverInfo) {
        (0, type_of_1.assertTypeOf)(serverInfo, 'string', 'serverInfo');
        this.serverInfo = serverInfo;
        return this;
    };
    /**
     * Sets the info text about a database sent in response to the `SHOW INFO` command.
     * **NOTE:** Calling this function overwrites the previous database info text.
     *
     * @param {string} database - The database whose text information is being set.
     * @param {string} databaseInfo - The database information text to send when clients
     * send the `SHOW INFO` command.
     */
    DictServer.prototype.setDatabaseInfo = function (database, databaseInfo) {
        (0, type_of_1.assertTypeOf)(database, 'string', 'database');
        (0, type_of_1.assertTypeOf)(databaseInfo, 'string', 'databaseInfo');
        this.databaseInfo[database] = databaseInfo;
        return this;
    };
    /**
     * Sets the help text sent in response to the `HELP` command.
     * **NOTE:** Calling this function overwrites the previous help text.
     *
     * @param {string} helpText - The help text to send when clients send
     * the `HELP` command.
     */
    DictServer.prototype.setHelpText = function (helpText) {
        (0, type_of_1.assertTypeOf)(helpText, 'string', 'helpText');
        this.helpText = helpText;
        return this;
    };
    // Additional methods
    /**
     * Shuts down the server asynchronously. Returns a `Promise` which resolves to
     * `this` once all connections to the server are dropped.
     *
     * **NOTE: THIS METHOD RETURNS A PROMISE OF THE `this` OBJECT AND, THUS,
     * CANNOT BE CHAINED - MAKE SURE TO CALL IT ON ITS OWN, AT THE END
     * OF A METHOD CHAIN, WITHIN A `.then()` CALLBACK, OR AFTER `await`.**
     *
     * @throws If the server was already down.
     */
    DictServer.prototype.shutdown = function () {
        return __awaiter(this, void 0, void 0, function () {
            var closePromise, _i, _a, sock;
            var _this = this;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        closePromise = new Promise(function (resolve, reject) {
                            _this.__server.close(function (err) { return (err ? reject(err) : resolve()); });
                        });
                        // Destroy active sockets
                        // @ts-expect-error: ES2015
                        for (_i = 0, _a = this.sockets; _i < _a.length; _i++) {
                            sock = _a[_i];
                            try {
                                sock.destroy();
                            }
                            catch (_c) { }
                        }
                        // Wait for full close
                        return [4 /*yield*/, closePromise];
                    case 1:
                        // Wait for full close
                        _b.sent();
                        return [2 /*return*/, this];
                }
            });
        });
    };
    /**
     * Sets a handler for a specific command.
     *
     * **NOTE:** Calling this function for some commands will override the default handlers.
     * If you set a handler, make sure to implement the necessary behavior as per RFC 2229.
     *
     * Multiple calls to `command()` will **NOT** register multiple handlers - they will
     * simply overwrite the previous one; thus, only the last call will register
     * a command handler.
     *
     * @param {string} commandName - The name of the command to be handled.
     * @param {CommandHandler} cb - The handler that will be called when
     * the specified command is received. It will be called with
     * a {@link DictCommand} and a {@link DictResponse} object as arguments.
     */
    DictServer.prototype.command = function (commandName, cb) {
        (0, type_of_1.assertTypeOf)(commandName, 'string', 'commandName');
        (0, type_of_1.assertTypeOf)(cb, 'function', 'cb');
        this.__handlers[commandName] = cb;
        return this;
    };
    /**
     * Makes the server start to listen for new connections.
     *
     * @param {string} port - The TCP port that the server should bind to. Default is 2628.
     * @param {Function} cb - The callback that will be executed when the server is listening.
     */
    DictServer.prototype.listen = function (port, cb) {
        if (port === void 0) { port = 2628; }
        if (cb === void 0) { cb = function () { }; }
        (0, type_of_1.assertTypeOf)(port, 'number', 'port');
        (0, range_1.assertRange)(port, 'port', 0, 65535);
        (0, type_of_1.assertTypeOf)(cb, 'function', 'cb');
        this.__server.listen(port, cb);
        return this;
    };
    /** @private The default handler for commands with no handler. */
    DictServer.prototype.__unknownHandler = function (_, response) {
        response.error(500);
    };
    /** @private The method that dispatches handlers. */
    DictServer.prototype.__dispatch = function (command, response) {
        return __awaiter(this, void 0, void 0, function () {
            var handler, error_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        handler = this.__handlers[command.name];
                        this.__commandHandler(command, response);
                        if (!command.syntaxValid) {
                            return [2 /*return*/, this.__syntaxHandler(command, response)];
                        }
                        if (!handler) {
                            return [2 /*return*/, this.__unknownHandler(command, response)];
                        }
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, handler(command, response)];
                    case 2:
                        _a.sent();
                        return [2 /*return*/];
                    case 3:
                        error_1 = _a.sent();
                        this.__handlerError(error_1, response);
                        return [3 /*break*/, 4];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    /** @private The default handler for commands with syntax errors. */
    DictServer.prototype.__syntaxHandler = function (_, response) {
        response.error(501);
    };
    /** @private The default handler called when a new connection is established. */
    DictServer.prototype.__connectHandler = function (response) {
        response.status(220, [
            {
                CAPABILITIES: this.capabilities.join('.'),
                MSGID: this.messageId,
                TEXT: this.welcomeText
            }
        ]);
    };
    /** @private The default handler called when another handler throws an error. */
    DictServer.prototype.__handlerError = function (error, response) {
        if (process.env.NODE_ENV !== 'test') {
            console.error('Handler error:', error);
        }
        response.error(420); // Server temporarily unavailable
    };
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    DictServer.prototype.__commandHandler = function (_, __) {
        /* default handler */
    };
    return DictServer;
}());
exports.DictServer = DictServer;
