import {
	CommandHandler,
	DictCommand,
	DatabaseInfo,
	StrategyInfo
} from './lib/libtypes';
import { createServer, type Server, type Socket } from 'node:net';
import { DictResponse } from './response.class';
import { handleClient } from './lib/libhandleclient';
import { assertTypeOf } from '@santi100a/assertion-lib/cjs/type-of';
import assertInstanceOf = require('@santi100a/assertion-lib/cjs/instance-of');
import { assertRange } from '@santi100a/assertion-lib/cjs/range';

/**
 * The main class for implementing the DICT server.
 * All methods of this class can be chained, except for `shutdown()`.
 */
export class DictServer {
	constructor() {
		this.__handlers = {
			DEFINE: (_, response) => response.error(502),
			MATCH: (_, response) => response.error(502),
			'SHOW DATABASES': (_, response) => {
				if (this.databases.length > 0) {
					response.writeDatabases(this.databases);
					return;
				}
				response.error(554);
			},
			'SHOW STRATEGIES': (_, response) => {
				if (this.strategies.length > 0) {
					response
						.status(111, [this.strategies.length])
						.writeMessage(
							this.strategies
								.map(({ name, description }) => `${name} "${description}"`)
								.join('\r\n')
						)
						.ok();
					return;
				}
				response.error(555);
			},
			'SHOW INFO': (command, response) => {
				if (this.databaseInfo[command.parameters[0]]) {
					response
						.status(112)
						.writeMessage(this.databaseInfo[command.parameters[0]])
						.ok();
					return;
				}
				response.error(550);
			},
			'SHOW SERVER': (_, response) => {
				response.status(114).writeMessage(this.serverInfo).ok();
			},
			'OPTION MIME': (_, response) => {
				response.optionMimeEnabled = true;
				response.ok();
			},
			CLIENT: (command, response) => {
				response.clientText = command.parameters.join(' ');
				response.ok();
			},
			AUTH: (_, response) => response.error(502),
			SASLAUTH: (_, response) => response.error(502),
			STATUS: (_, response) => response.ok(),
			HELP: (_, response) => {
				response.status(113).writeMessage(this.helpText).ok();
			},
			QUIT: (_, response) => response.status(221, []).close(),
			SHOW: (_, response) => response.error(501),
			OPTION: (_, response) => response.error(501)
		};

		this.__server = createServer(socket => {
			// Track sockets for clean shutdown
			this.sockets.add(socket);
			socket.on('close', () => this.sockets.delete(socket));

			const response = new DictResponse(socket);

			// CONNECT hook (once per connection)
			this.__connectHandler(response);

			// Create a promise chain for serialization
			let processingChain: Promise<unknown> = Promise.resolve();

			const serializedDispatch = (command: DictCommand, res: DictResponse) => {
				// Create a new promise that chains to the previous work
				const task = () => this.__dispatch(command, res);

				// Chain it (handle both success and failure paths)
				processingChain = processingChain.then(task, task);

				// Return the chain so handleClient actually waits
				return processingChain;
			};

			// ONE read loop
			handleClient(socket, serializedDispatch, response).catch(err => {
				if (!socket.destroyed) {
					socket.destroy();
				}
				if (process.env.NODE_ENV !== 'test') {
					console.error(err);
				}
			});
		});

		// Cleanup leftover sockets when server closes
		this.__server.on('close', () => {
			// @ts-expect-error: ES2015
			for (const sock of this.sockets) {
				if (!sock.destroyed) sock.destroy();
			}
			this.sockets.clear();
		});
	}

	// Public members

	/** @readonly Server banner welcome text. */
	welcomeText = 'welcome';

	/** @readonly Server capabilities. */
	capabilities = ['mime'];

	/** @readonly The message ID for the banner. */
	messageId = '12345.1234.1234567890@host.org';

	/** @readonly The available databases on the server. */
	databases: DatabaseInfo[] = [];

	/** @readonly The available strategies on the server. */
	strategies: StrategyInfo[] = [];

	/** @readonly The info text for the server. */
	serverInfo = '';

	/** @readonly The info text for each database. */
	databaseInfo: Record<string, string> = {};

	/** @readonly The help text sent by the `HELP` command. */
	helpText = `DEFINE <database> <word>            -- look up word in database
	MATCH <database> <strategy> <word>  -- match word in database using strategy
SHOW DB or SHOW DATABASES           -- list all accessible databases
SHOW STRAT or SHOW STRATEGIES       -- list available matching strategies
SHOW INFO <database>                -- provide information about the database
SHOW SERVER                         -- provide site-specific information
OPTION MIME                         -- use MIME headers
CLIENT [info]                       -- identify client to server
AUTH <user> <string>                -- provide authentication information
STATUS                              -- display status information
HELP                                -- display this help information
QUIT                                -- terminate connection`;

	/** @readonly A set of `Socket` objects representing current connections. */
	readonly sockets = new Set<Socket>();

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
	define<T>(cb: CommandHandler<T>): this {
		assertTypeOf(cb, 'function', 'cb');
		return this.command('DEFINE', cb);
	}

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
	match<T>(cb: CommandHandler<T>): this {
		assertTypeOf(cb, 'function', 'cb');
		return this.command('MATCH', cb);
	}

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
	showDatabases<T>(cb: (response: DictResponse) => T): this {
		assertTypeOf(cb, 'function', 'cb');
		return this.command('SHOW DB', (_, response) => cb(response));
	}

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
	showStrategies<T>(cb: (response: DictResponse) => T): this {
		assertTypeOf(cb, 'function', 'cb');
		return this.command('SHOW STRAT', (_, response) => cb(response));
	}

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
	showInfo<T>(cb: CommandHandler<T>): this {
		assertTypeOf(cb, 'function', 'cb');
		return this.command('SHOW INFO', cb);
	}

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
	showServer<T>(cb: CommandHandler<T>): this {
		assertTypeOf(cb, 'function', 'cb');
		return this.command('SHOW SERVER', cb);
	}

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
	optionMime<T>(cb: CommandHandler<T>): this {
		assertTypeOf(cb, 'function', 'cb');
		return this.command('OPTION MIME', cb);
	}

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
	show<T>(cb: CommandHandler<T>): this {
		assertTypeOf(cb, 'function', 'cb');
		return this.command('SHOW', cb);
	}

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
	option<T>(cb: CommandHandler<T>): this {
		assertTypeOf(cb, 'function', 'cb');
		return this.command('OPTION', cb);
	}

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
	client<T>(cb: CommandHandler<T>): this {
		assertTypeOf(cb, 'function', 'cb');
		return this.command('CLIENT', cb);
	}

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
	status<T>(cb: CommandHandler<T>) {
		assertTypeOf(cb, 'function', 'cb');
		return this.command('STATUS', cb);
	}

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
	help<T>(cb: CommandHandler<T>): this {
		assertTypeOf(cb, 'function', 'cb');
		return this.command('HELP', cb);
	}

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
	quit<T>(cb: CommandHandler<T>): this {
		assertTypeOf(cb, 'function', 'cb');
		return this.command('QUIT', cb);
	}

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
	onUnknownCommand(cb: CommandHandler): this {
		assertTypeOf(cb, 'function', 'cb');
		this.__unknownHandler = cb;
		return this;
	}

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
	onCommand(cb: CommandHandler): this {
		assertTypeOf(cb, 'function', 'cb');
		this.__commandHandler = cb;
		return this;
	}

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
	onSyntaxError(cb: CommandHandler): this {
		assertTypeOf(cb, 'function', 'cb');
		this.__syntaxHandler = cb;
		return this;
	}

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
	onConnect(cb: (response: DictResponse) => unknown): this {
		assertTypeOf(cb, 'function', 'cb');
		this.__connectHandler = cb;
		return this;
	}

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
	onHandlerError(cb: (error: Error, response: DictResponse) => unknown): this {
		assertTypeOf(cb, 'function', 'cb');
		this.__handlerError = cb;
		return this;
	}

	// Setters
	/**
	 * Sets the first part of the welcome banner sent to clients.
	 * **NOTE:** Calling this function overwrites the previous welcome text.
	 *
	 * @param {string} welcomeText - The text to be sent first in the welcome banner.
	 */
	setWelcomeText(welcomeText: string): this {
		assertTypeOf(welcomeText, 'string', 'welcomeText');
		this.welcomeText = welcomeText;
		return this;
	}

	/**
	 * Sets the list of capabilities sent to clients.
	 * **NOTE:** Calling this function overwrites the previous capabilities list.
	 *
	 * @param {string[]} capabilities - The capabilities to be sent in the welcome banner.
	 */
	setCapabilities(...capabilities: string[]): this {
		assertInstanceOf(capabilities, Array, 'capabilities');
		this.capabilities = capabilities;
		return this;
	}

	/**
	 * Sets the message ID sent to clients.
	 * **NOTE:** Calling this function overwrites the previous message ID.
	 *
	 * @param {string} messageId - The message ID to be sent in the welcome banner.
	 */
	setMessageId(messageId: string) {
		assertTypeOf(messageId, 'string', 'messageId');
		this.messageId = messageId;
		return this;
	}

	/**
	 * Sets the list of strategies sent to clients.
	 * **NOTE:** Calling this function overwrites the previous list of strategies.
	 *
	 * @param {StrategyInfo[]} strategies - The list of strategies to send
	 * when clients send the `SHOW STRAT` command.
	 */
	setStrategies(...strategies: StrategyInfo[]) {
		assertInstanceOf(strategies, Array, 'strategies');

		this.strategies = strategies;
		return this;
	}

	/**
	 * Sets the list of databases sent to clients.
	 * **NOTE:** Calling this function overwrites the previous list of databases.
	 *
	 * @param {DatabaseInfo[]} databases - The list of databases to send
	 * when clients send the `SHOW DB` command.
	 */
	setDatabases(...databases: DatabaseInfo[]) {
		assertInstanceOf(databases, Array, 'databases');
		this.databases = databases;
		return this;
	}

	/**
	 * Sets the server information text sent in response to the `SHOW SERVER` command.
	 * **NOTE:** Calling this function overwrites the previous server info text.
	 *
	 * @param {string} serverInfo - The info text to send when clients send the
	 * `SHOW SERVER` command.
	 */
	setServerInfo(serverInfo: string) {
		assertTypeOf(serverInfo, 'string', 'serverInfo');
		this.serverInfo = serverInfo;
		return this;
	}

	/**
	 * Sets the info text about a database sent in response to the `SHOW INFO` command.
	 * **NOTE:** Calling this function overwrites the previous database info text.
	 *
	 * @param {string} database - The database whose text information is being set.
	 * @param {string} databaseInfo - The database information text to send when clients
	 * send the `SHOW INFO` command.
	 */
	setDatabaseInfo(database: string, databaseInfo: string) {
		assertTypeOf(database, 'string', 'database');
		assertTypeOf(databaseInfo, 'string', 'databaseInfo');
		this.databaseInfo[database] = databaseInfo;
		return this;
	}

	/**
	 * Sets the help text sent in response to the `HELP` command.
	 * **NOTE:** Calling this function overwrites the previous help text.
	 *
	 * @param {string} helpText - The help text to send when clients send
	 * the `HELP` command.
	 */
	setHelpText(helpText: string) {
		assertTypeOf(helpText, 'string', 'helpText');
		this.helpText = helpText;
		return this;
	}

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
	async shutdown(): Promise<this> {
		// Stop accepting new connections
		const closePromise = new Promise<void>((resolve, reject) => {
			this.__server.close(err => (err ? reject(err) : resolve()));
		});

		// Destroy active sockets
		// @ts-expect-error: ES2015
		for (const sock of this.sockets) {
			try {
				sock.destroy();
			} catch {}
		}

		// Wait for full close
		await closePromise;
		return this;
	}

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
	command<T, R extends DictResponse>(
		commandName: string,
		cb: CommandHandler<T, R>
	) {
		assertTypeOf(commandName, 'string', 'commandName');
		assertTypeOf(cb, 'function', 'cb');

		this.__handlers[commandName] = cb as CommandHandler;
		return this;
	}

	/**
	 * Makes the server start to listen for new connections.
	 *
	 * @param {string} port - The TCP port that the server should bind to. Default is 2628.
	 * @param {Function} cb - The callback that will be executed when the server is listening.
	 */
	listen(port = 2628, cb: () => unknown = () => {}) {
		assertTypeOf(port, 'number', 'port');
		assertRange(port, 'port', 0, 65535);
		assertTypeOf(cb, 'function', 'cb');
		this.__server.listen(port, cb);

		return this;
	}

	// Private members

	/** @private The raw TCP server. */
	private readonly __server: Server;

	/** @private The object containing all handlers for commands. */
	private readonly __handlers: Partial<Record<string, CommandHandler>> = {};

	/** @private The default handler for commands with no handler. */
	private __unknownHandler(_: DictCommand, response: DictResponse) {
		response.error(500);
	}

	/** @private The method that dispatches handlers. */
	private async __dispatch(command: DictCommand, response: DictResponse) {
		const handler = this.__handlers[command.name];

		this.__commandHandler(command, response);

		if (!command.syntaxValid) {
			return this.__syntaxHandler(command, response);
		}

		if (!handler) {
			return this.__unknownHandler(command, response);
		}

		try {
			await handler(command, response);
			return;
		} catch (error) {
			this.__handlerError(error as Error, response);
		}
	}

	/** @private The default handler for commands with syntax errors. */
	private __syntaxHandler(_: DictCommand, response: DictResponse) {
		response.error(501);
	}

	/** @private The default handler called when a new connection is established. */
	private __connectHandler(response: DictResponse) {
		response.status(220, [
			{
				CAPABILITIES: this.capabilities.join('.'),
				MSGID: this.messageId,
				TEXT: this.welcomeText
			}
		]);
	}
	/** @private The default handler called when another handler throws an error. */
	private __handlerError(error: Error, response: DictResponse) {
		if (process.env.NODE_ENV !== 'test') {
			console.error('Handler error:', error);
		}
		response.error(420); // Server temporarily unavailable
	}
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	private __commandHandler(_: DictCommand, __: DictResponse) {
		/* default handler */
	}
}
