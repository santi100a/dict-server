import { assertInstanceOf, assertTypeOf, assertArray, assertOneOfTypes } from '@santi100a/assertion-lib';
import { type Socket } from 'node:net';
import { ErrorHandler, DictCommand, DictDefinition } from './lib/libtypes';

export class DictResponse {
	lastCommand: DictCommand | null = null;
	initialized = false;
	authenticated = false;
	optionMime = false;
	messageId = '';
	clientName = '';

	constructor(
		private readonly __socket: Socket,
		private readonly __hostname: string,
		private readonly __capabilities: string[],
		private readonly __statusCodes: Record<number | string, string>,
		private readonly __errorHandlers: Record<string, ErrorHandler>,
		private readonly __generateMessageId: () => string,
		private readonly __generateWelcome: () => string
	) {}

	write(
		buffer: Uint8Array | string,
		cb?: (err?: Error | null) => void
	): DictResponse;
	write(
		str: Uint8Array | string,
		encoding?: BufferEncoding,
		cb?: (err?: Error | null) => void
	): DictResponse;

	write(
		input: Uint8Array | string,
		cbOrEncoding?: ((err?: Error | null) => void) | BufferEncoding,
		cb?: (err?: Error | null) => void
	) {
		if (typeof input !== 'string')
			assertInstanceOf(input, Uint8Array, 'input');

		if (typeof cbOrEncoding !== 'function') {
			assertTypeOf(cbOrEncoding, 'string', 'encoding');
			this.__socket.write(input, cbOrEncoding, cb);
		} else {
			this.__socket.write(input, cb);
		}
		return this;
	}

	initialize() {
		if (this.initialized) return this;
		this.initialized = true;
		if (this.__onInit) this.__onInit(this);
		return this;
	}

	onInit<T = unknown>(initializer: (response: DictResponse) => T) {
		assertTypeOf(initializer, 'function', 'initializer');
		this.__onInit = initializer;
	}

	writeln(input: string) {
		assertTypeOf(input, 'string', 'input');
		this.write(input.concat('\r\n'));
		return this;
	}

	writeMultiline(input: string) {
		assertTypeOf(input, 'string', 'input');
		const lines = input.split(/\r?\n/);
		for (const line of lines) {
			if (line.startsWith('.')) {
				this.writeln(`.${line}`);
			} else {
				this.writeln(line);
			}
		}
		return this.writeln('.');
	}

	writeDefinitions(definitions: DictDefinition[]) {
		assertArray(definitions, 'definitions');
		this.status(150, definitions.length, this.__statusCodes[150]);
		for (const definition of definitions) {
			this.status(
				151,
				`${definition.headword}`,
				definition.dictionary,
				`{definition.dictionaryDescription}`
			);
			this.writeMultiline(definition.definition);
		}
		this.status(250);
	}
	error(code: number): DictResponse;
	error(code: number, message: string): DictResponse;
	error(code: number, message?: string) {
		assertTypeOf(code, 'number', 'code');
		const errorHandler = this.__errorHandlers[code];
		if (message !== undefined) {
			assertTypeOf(message, 'string', 'message');
			this.status(code, message);
			const modified = structuredClone(this);
			modified.write = () => this;

			// Call error handler and suppress writes
			errorHandler(code, this.lastCommand, modified);
		} else if (errorHandler) {
			errorHandler(code, this.lastCommand, this);
			return this;
		}
		return this.status(code);
	}

	status(code: number, ...params: (string | number)[]) {
		assertTypeOf(code, 'number', 'code');
		for (const param of params) {
			assertOneOfTypes(param, ['string', 'number'], 'param');
		}

		if (params.length > 0) return this.writeln(`${code} ${params.join(' ')}`);
		const defaultText = this.__statusCodes[String(code)];
		return this.writeln(
			String(code).concat(defaultText ? ' '.concat(defaultText) : '')
		);
	}

	enableMime() {
		this.optionMime = true;
	}

	end(cb?: () => void) {
		if (cb) assertTypeOf(cb, 'function', 'cb');
		return this.__socket.end(cb);
	}

	private __onInit(response: DictResponse) {
		const tokens = ['220', this.__hostname];
		const welcomeMessage = this.__generateWelcome();

		this.messageId = this.__generateMessageId();

		if (welcomeMessage) tokens.push(welcomeMessage);
		tokens.push(`<${this.__capabilities.join('.')}>`, this.messageId);
		response.writeln(tokens.join(' '));
	}
}
