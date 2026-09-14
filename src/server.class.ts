import { assertInstanceOf, assertTypeOf } from '@santi100a/assertion-lib';
import { randomBytes } from 'node:crypto';
import { Server, Socket } from 'node:net';
import { parseCommand } from './lib/libparsecommand';
import { createLineReader } from './lib/libreadline';
import { STATUS_MESSAGES } from './lib/libstatusmessages';
import {
	CommandHandler,
	DictCommand,
	ErrorHandler,
	FilterResult,
	Interceptor,
	ServerConfig
} from './lib/libtypes';
import { DictResponse } from './response.class';

export class DictServer extends Server {
	statusMessages = this.config.statusMessages ?? STATUS_MESSAGES;
	maxDictConnections = this.config.connectionLimit ?? 100;
	idleDelay = this.config.idleDelay ?? 120_000;
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	private __connectionFilter(_: Socket): FilterResult {
		return {
			canConnect: true,
			statusCode: 220,
			statusMessage: this.statusMessages[220]
		};
	}
	private readonly __connections: Socket[] = [];
	private readonly __commandHandlers: Record<string, CommandHandler> = {
		QUIT: (_, response) => response.status(221).end(),
		DEFINE: (_, response) => response.error(502),
		MATCH: (_, response) => response.error(502),
		CLIENT: (command, response) => {
			response.clientName = command.parameters.join(' ');
			response.status(250);
		},
		STATUS: (_, response) => response.status(210),
		HELP: (_, response) => {
			return response
				.status(113)
				.writeMultiline(this.config.helpText ?? '')
				.status(250);
		},
		AUTH: (_, response) => response.error(502),
		SASLAUTH: (_, response) => response.error(502),
		SASLRESP: (_, response) => response.error(502),

		'SHOW DATABASES': (_, response) => {
			const databases = this.config.databases;
			const availableDatabases = Object.entries(databases).filter(
				db =>
					!db[1].authRequired || (db[1].authRequired && response.authenticated)
			);
			if (availableDatabases.length === 0) return response.error(554);
			response.status(110, availableDatabases.length, this.statusMessages[110]);

			for (const database of availableDatabases) {
				response.writeln(`${database[0]} "${database[1].description}"`);
			}
			response.writeln('.').status(250);
		},
		'SHOW STRATEGIES': (_, response) => {
			const strategies = this.config.strategies;
			if (!strategies || strategies.length === 0) return response.error(555);
			response.status(111, strategies.length, this.statusMessages[111]);

			for (const strategy of strategies) {
				response.writeln(`${strategy.name} "${strategy.description}"`);
			}
			response.writeln('.');
			response.status(250);
		},
		'SHOW INFO': (command, response) => {
			const info = this.config.databases?.[command.parameters?.[0]]?.infoText;
			response.status(112);
			response.writeMultiline(info ?? '');
			response.status(250);
		},
		'SHOW SERVER': (_, response) => {
			const info = this.config.infoText;
			response.status(114);
			response.writeMultiline(info ?? '');
			response.status(250);
		},
		'OPTION MIME': (_, response) => {
			response.enableMime();
			response.status(250, '- MIME enabled');
		}
	};
	private readonly __errorHandlers: Record<string, ErrorHandler> = {};

	private readonly __interceptors: Interceptor[] = [];
	constructor(readonly config: ServerConfig) {
		assertInstanceOf(config, Object, 'config');

		super();
		this.on('connection', this.__handler);
	}

	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	private __onCommand(_: DictCommand) {
		// Nothing!
	}
	private __onConnection(response: DictResponse) {
		response.initialize();
	}

	private __generateWelcome() {
		return this.config.welcomeText;
	}

	private __generateMessageId() {
		return `<${Date.now()}.${randomBytes(8).toString('hex')}@${this.config.hostname}>`;
	}

	private async __handler(socket: Socket) {
		assertInstanceOf(
			socket,
			Socket as new (...args: unknown[]) => Socket,
			'socket'
		);
		const response = new DictResponse(
			socket,
			this.config.hostname ?? '',
			this.config.capabilities ?? [],
			this.statusMessages,
			this.__errorHandlers,

			// Use arrow syntax to bind callback context to this server
			() => this.__generateMessageId(),
			() => this.__generateWelcome() ?? ''
		);
		if (this.__connections.length >= this.maxDictConnections)
			return response.status(420).end();

		this.__connections.push(socket);
		socket.setTimeout(this.idleDelay);
		// Remove the socket from the array when it closes
		socket.once('close', () => {
			const index = this.__connections.indexOf(socket);
			if (index !== -1) {
				this.__connections.splice(index, 1);
			}
		});
		socket.on('timeout', () => {
			socket.end();
		});

		const filterResult = this.__connectionFilter(socket);

		const lineReader = createLineReader(socket);
		if (!filterResult.canConnect)
			return response
				.status(filterResult.statusCode, filterResult.statusMessage)
				.end();
		this.__onConnection(response);
		while (true) {
			const line = await lineReader();
			if (line === null) return; // Socket ended
			const command = parseCommand(line);
			response.lastCommand = command;
			this.__interceptors[0]?.(command, response, this.__interceptors[1]);
			this.__onCommand(command);

			const commandHandler = this.__commandHandlers[command.name];
			if (!commandHandler) {
				response.error(500);
				continue;
			}
			commandHandler(command, response);
		}
	}

	// STANDARD COMMANDS

	define(handler: CommandHandler) {
		return this.commandHandler('DEFINE', handler);
	}
	match(handler: CommandHandler) {
		return this.commandHandler('MATCH', handler);
	}
	showDatabases(handler: CommandHandler) {
		return this.commandHandler('SHOW DATABASES', handler);
	}
	showStrategies(handler: CommandHandler) {
		return this.commandHandler('SHOW STRATEGIES', handler);
	}
	showInfo(handler: CommandHandler) {
		return this.commandHandler('SHOW INFO', handler);
	}
	showServer(handler: CommandHandler) {
		return this.commandHandler('SHOW SERVER', handler);
	}
	client(handler: CommandHandler) {
		return this.commandHandler('CLIENT', handler);
	}
	status(handler: CommandHandler) {
		return this.commandHandler('STATUS', handler);
	}
	help(handler: CommandHandler) {
		return this.commandHandler('HELP', handler);
	}
	quit(handler: CommandHandler) {
		return this.commandHandler('QUIT', handler);
	}
	optionMime(handler: CommandHandler) {
		return this.commandHandler('OPTION MIME', handler);
	}
	auth(handler: CommandHandler) {
		return this.commandHandler('AUTH', handler);
	}
	saslAuth(handler: CommandHandler) {
		return this.commandHandler('SASLAUTH', handler);
	}
	saslResp(handler: CommandHandler) {
		return this.commandHandler('SASLRESP', handler);
	}

	use(interceptor: Interceptor) {
		assertTypeOf(interceptor, 'function', 'interceptor');
		this.__interceptors.push(interceptor);
	}
	setErrorHandler(code: number, handler: ErrorHandler) {
		assertTypeOf(code, 'number', 'code');
		assertTypeOf(handler, 'function', 'handler');
		this.__errorHandlers[code] = handler;
	}

	setConnectionFilter(filter: (socket: Socket) => FilterResult) {
		assertTypeOf(filter, 'function', 'filter');
		this.__connectionFilter = filter;
	}

	setWelcomeGenerator(generator: () => string) {
		assertTypeOf(generator, 'function', 'generator');
		this.__generateWelcome = generator;
	}

	setStatusCodes(statusCodes: Record<string | number, string>) {
		assertInstanceOf(statusCodes, Object, 'statusCodes');
		this.statusMessages = statusCodes;
	}

	addStatusCode(code: number, text: string) {
		assertTypeOf(code, 'number', 'code');
		assertTypeOf(text, 'string', 'text');
		this.statusMessages = { ...this.statusMessages, [code]: text };
	}

	addStatusCodes(codes: Record<string | number, string>) {
		assertInstanceOf(codes, Object, 'codes');
		this.statusMessages = {
			...this.statusMessages,
			...codes
		};
	}

	onCommand<T = unknown>(handler: (command: DictCommand) => T) {
		assertTypeOf(handler, 'function', 'handler');
		this.__onCommand = handler;
	}

	commandHandler(command: string, handler: CommandHandler) {
		assertTypeOf(command, 'string', 'command');
		assertTypeOf(handler, 'function', 'handler');
		this.__commandHandlers[command.toUpperCase()] = handler;
	}

	onConnection<T = unknown>(handler: (response: DictResponse) => T) {
		assertTypeOf(handler, 'function', 'handler');
		this.__onConnection = handler;
	}

	shutdown() {
		this.close();
		this.__connections.forEach(connection => {
			try {
				connection.destroy();
			} catch {}
		});
	}
}
