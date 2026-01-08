import { CommandHandler, DatabaseInfo, StrategyInfo } from './lib/libtypes';
import { DictResponse } from './response.class';
/**
 * The main class for implementing the DICT server.
 * All methods of this class can be chained, except for `shutdown()`.
 */
export declare class DictServer {
    constructor();
    /** @readonly Server banner welcome text. */
    welcomeText: string;
    /** @readonly Server capabilities. */
    capabilities: string[];
    /** @readonly The message ID for the banner. */
    messageId: string;
    /** @readonly The available databases on the server. */
    databases: DatabaseInfo[];
    /** @readonly The available strategies on the server. */
    strategies: StrategyInfo[];
    /** @readonly The info text for the server. */
    serverInfo: string;
    /** @readonly The info text for each database. */
    databaseInfo: Record<string, string>;
    /** @readonly The help text sent by the `HELP` command. */
    helpText: string;
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
    define<T>(cb: CommandHandler<T>): this;
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
    match<T>(cb: CommandHandler<T>): this;
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
    showDatabases<T>(cb: (response: DictResponse) => T): this;
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
    showStrategies<T>(cb: (response: DictResponse) => T): this;
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
    showInfo<T>(cb: CommandHandler<T>): this;
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
    showServer<T>(cb: CommandHandler<T>): this;
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
    optionMime<T>(cb: CommandHandler<T>): this;
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
    show<T>(cb: CommandHandler<T>): this;
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
    option<T>(cb: CommandHandler<T>): this;
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
    client<T>(cb: CommandHandler<T>): this;
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
    status<T>(cb: CommandHandler<T>): this;
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
    help<T>(cb: CommandHandler<T>): this;
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
    quit<T>(cb: CommandHandler<T>): this;
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
    onUnknownCommand(cb: CommandHandler): this;
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
    onCommand(cb: CommandHandler): this;
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
    onSyntaxError(cb: CommandHandler): this;
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
    onConnect(cb: (response: DictResponse) => unknown): this;
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
    onHandlerError(cb: (error: Error, response: DictResponse) => unknown): this;
    /**
     * Sets the first part of the welcome banner sent to clients.
     * **NOTE:** Calling this function overwrites the previous welcome text.
     *
     * @param {string} welcomeText - The text to be sent first in the welcome banner.
     */
    setWelcomeText(welcomeText: string): this;
    /**
     * Sets the list of capabilities sent to clients.
     * **NOTE:** Calling this function overwrites the previous capabilities list.
     *
     * @param {string[]} capabilities - The capabilities to be sent in the welcome banner.
     */
    setCapabilities(...capabilities: string[]): this;
    /**
     * Sets the message ID sent to clients.
     * **NOTE:** Calling this function overwrites the previous message ID.
     *
     * @param {string} messageId - The message ID to be sent in the welcome banner.
     */
    setMessageId(messageId: string): this;
    /**
     * Sets the list of strategies sent to clients.
     * **NOTE:** Calling this function overwrites the previous list of strategies.
     *
     * @param {StrategyInfo[]} strategies - The list of strategies to send
     * when clients send the `SHOW STRAT` command.
     */
    setStrategies(...strategies: StrategyInfo[]): this;
    /**
     * Sets the list of databases sent to clients.
     * **NOTE:** Calling this function overwrites the previous list of databases.
     *
     * @param {DatabaseInfo[]} databases - The list of databases to send
     * when clients send the `SHOW DB` command.
     */
    setDatabases(...databases: DatabaseInfo[]): this;
    /**
     * Sets the server information text sent in response to the `SHOW SERVER` command.
     * **NOTE:** Calling this function overwrites the previous server info text.
     *
     * @param {string} serverInfo - The info text to send when clients send the
     * `SHOW SERVER` command.
     */
    setServerInfo(serverInfo: string): this;
    /**
     * Sets the info text about a database sent in response to the `SHOW INFO` command.
     * **NOTE:** Calling this function overwrites the previous database info text.
     *
     * @param {string} database - The database whose text information is being set.
     * @param {string} databaseInfo - The database information text to send when clients
     * send the `SHOW INFO` command.
     */
    setDatabaseInfo(database: string, databaseInfo: string): this;
    /**
     * Sets the help text sent in response to the `HELP` command.
     * **NOTE:** Calling this function overwrites the previous help text.
     *
     * @param {string} helpText - The help text to send when clients send
     * the `HELP` command.
     */
    setHelpText(helpText: string): this;
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
    shutdown(): Promise<this>;
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
    command<T, R extends DictResponse>(commandName: string, cb: CommandHandler<T, R>): this;
    /**
     * Makes the server start to listen for new connections.
     *
     * @param {string} port - The TCP port that the server should bind to. Default is 2628.
     * @param {Function} cb - The callback that will be executed when the server is listening.
     */
    listen(port?: number, cb?: () => unknown): this;
    /** @private The raw TCP server. */
    private readonly __server;
    /** @private The object containing all handlers for commands. */
    private readonly __handlers;
    /** @private The default handler for commands with no handler. */
    private __unknownHandler;
    /** @private The method that dispatches handlers. */
    private __dispatch;
    /** @private The default handler for commands with syntax errors. */
    private __syntaxHandler;
    /** @private The default handler called when a new connection is established. */
    private __connectHandler;
    /** @private The default handler called when another handler throws an error. */
    private __handlerError;
    private __commandHandler;
}
