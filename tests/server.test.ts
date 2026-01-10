import { DictServer } from '../src/server.class';
import { DictResponse } from '../src/response.class';
import { Socket } from 'node:net';

describe('DictServer', () => {
	let server: DictServer;
	let mockSocket: Socket;
	let response: DictResponse;

	beforeEach(() => {
		server = new DictServer();
		
		// Create a mock socket
		mockSocket = new Socket();

		// @ts-expect-error: Read-only property
		mockSocket.destroyed = false;
		mockSocket.writable = true;
		
		// Mock the write method
		jest.spyOn(mockSocket, 'write').mockReturnValue(true);
		jest.spyOn(mockSocket, 'end').mockImplementation(() => mockSocket);
		jest.spyOn(mockSocket, 'destroy').mockImplementation(() => mockSocket);
		
		response = new DictResponse(mockSocket);
	});

	afterEach(async () => {
		if (server) {
			try {
				await server.shutdown();
			} catch {
				// Server may not be running
			}
		}
		jest.restoreAllMocks();
	});

	describe('Constructor and Initialization', () => {
		it('should create a new DictServer instance', () => {
			expect(server).toBeInstanceOf(DictServer);
		});

		it('should initialize with default values', () => {
			expect(server.welcomeText).toBe('welcome');
			expect(server.capabilities).toEqual(['mime']);
			expect(server.messageId).toBe('12345.1234.1234567890@host.org');
			expect(server.databases).toEqual([]);
			expect(server.strategies).toEqual([]);
			expect(server.serverInfo).toBe('');
			expect(server.databaseInfo).toEqual({});
		});

		it('should have default help text', () => {
			expect(server.helpText).toContain('DEFINE');
			expect(server.helpText).toContain('MATCH');
			expect(server.helpText).toContain('SHOW');
		});
	});

	describe('Setter Methods (Chainable)', () => {
		it('should set welcome text and return this', () => {
			const result = server.setWelcomeText('Custom Welcome');
			expect(server.welcomeText).toBe('Custom Welcome');
			expect(result).toBe(server);
		});

		it('should set capabilities and return this', () => {
			const result = server.setCapabilities('auth', 'kerberos_v4');
			expect(server.capabilities).toEqual(['auth', 'kerberos_v4']);
			expect(result).toBe(server);
		});

		it('should set message ID and return this', () => {
			const result = server.setMessageId('test@example.com');
			expect(server.messageId).toBe('test@example.com');
			expect(result).toBe(server);
		});

		it('should set strategies and return this', () => {
			const strategies = [
				{ name: 'exact', description: 'Exact match' },
				{ name: 'prefix', description: 'Prefix match' }
			];
			const result = server.setStrategies(...strategies);
			expect(server.strategies).toEqual(strategies);
			expect(result).toBe(server);
		});

		it('should set databases and return this', () => {
			const databases = [
				{ name: 'wn', description: 'WordNet' },
				{ name: 'gcide', description: 'GNU Collaborative Dictionary' }
			];
			const result = server.setDatabases(...databases);
			expect(server.databases).toEqual(databases);
			expect(result).toBe(server);
		});

		it('should set server info and return this', () => {
			const result = server.setServerInfo('Test Server Info');
			expect(server.serverInfo).toBe('Test Server Info');
			expect(result).toBe(server);
		});

		it('should set database info and return this', () => {
			const result = server.setDatabaseInfo('wn', 'WordNet information');
			expect(server.databaseInfo['wn']).toBe('WordNet information');
			expect(result).toBe(server);
		});

		it('should set help text and return this', () => {
			const result = server.setHelpText('Custom help text');
			expect(server.helpText).toBe('Custom help text');
			expect(result).toBe(server);
		});

		it('should allow method chaining', () => {
			const result = server
				.setWelcomeText('Test')
				.setCapabilities('mime')
				.setMessageId('test@test.com')
				.setServerInfo('Info');
			
			expect(result).toBe(server);
			expect(server.welcomeText).toBe('Test');
			expect(server.messageId).toBe('test@test.com');
		});
	});

	describe('Command Handler Registration', () => {
		it('should register DEFINE handler', () => {
			const handler = jest.fn();
			const result = server.define(handler);
			expect(result).toBe(server);
		});

		it('should register MATCH handler', () => {
			const handler = jest.fn();
			const result = server.match(handler);
			expect(result).toBe(server);
		});

		it('should register SHOW DATABASES handler', () => {
			const handler = jest.fn();
			const result = server.showDatabases(handler);
			expect(result).toBe(server);
		});

		it('should register SHOW STRATEGIES handler', () => {
			const handler = jest.fn();
			const result = server.showStrategies(handler);
			expect(result).toBe(server);
		});

		it('should register SHOW INFO handler', () => {
			const handler = jest.fn();
			const result = server.showInfo(handler);
			expect(result).toBe(server);
		});

		it('should register SHOW SERVER handler', () => {
			const handler = jest.fn();
			const result = server.showServer(handler);
			expect(result).toBe(server);
		});

		it('should register OPTION MIME handler', () => {
			const handler = jest.fn();
			const result = server.optionMime(handler);
			expect(result).toBe(server);
		});

		it('should register CLIENT handler', () => {
			const handler = jest.fn();
			const result = server.client(handler);
			expect(result).toBe(server);
		});

		it('should register STATUS handler', () => {
			const handler = jest.fn();
			const result = server.status(handler);
			expect(result).toBe(server);
		});

		it('should register HELP handler', () => {
			const handler = jest.fn();
			const result = server.help(handler);
			expect(result).toBe(server);
		});

		it('should register QUIT handler', () => {
			const handler = jest.fn();
			const result = server.quit(handler);
			expect(result).toBe(server);
		});

		it('should register SHOW fallback handler', () => {
			const handler = jest.fn();
			const result = server.show(handler);
			expect(result).toBe(server);
		});

		it('should register OPTION fallback handler', () => {
			const handler = jest.fn();
			const result = server.option(handler);
			expect(result).toBe(server);
		});

		it('should register custom command handler', () => {
			const handler = jest.fn();
			const result = server.command('CUSTOM', handler);
			expect(result).toBe(server);
		});

		it('should throw on non-function handler', () => {
			expect(() => {
				// @ts-expect-error Testing invalid input
				server.define('not a function');
			}).toThrow();
		});
	});

	describe('Event Handler Registration', () => {
		it('should register onUnknownCommand handler', () => {
			const handler = jest.fn();
			const result = server.onUnknownCommand(handler);
			expect(result).toBe(server);
		});

		it('should register onCommand handler', () => {
			const handler = jest.fn();
			const result = server.onCommand(handler);
			expect(result).toBe(server);
		});

		it('should register onSyntaxError handler', () => {
			const handler = jest.fn();
			const result = server.onSyntaxError(handler);
			expect(result).toBe(server);
		});

		it('should register onConnect handler', () => {
			const handler = jest.fn();
			const result = server.onConnect(handler);
			expect(result).toBe(server);
		});

		it('should register onHandlerError handler', () => {
			const handler = jest.fn();
			const result = server.onHandlerError(handler);
			expect(result).toBe(server);
		});
	});

	describe('Listen and Shutdown', () => {
		it('should start listening on specified port', () => {
			return new Promise<void>((resolve) => {
				server.listen(0, () => {
					expect(server['__server'].listening).toBe(true);
					resolve();
				});
			});
		});

		it('should start listening on default port 2628', () => {
			return new Promise<void>((resolve) => {
				server.listen(undefined, () => {
					expect(server['__server'].listening).toBe(true);
					resolve();
				});
			});
		});

		it('should shutdown gracefully', async () => {
			await new Promise<void>((resolve) => {
				server.listen(0, resolve);
			});

			const result = await server.shutdown();
			expect(result).toBe(server);
			expect(server['__server'].listening).toBe(false);
		});

		it('should throw when shutting down non-running server', async () => {
			await expect(server.shutdown()).rejects.toThrow();
		});

		it('should return this for chaining after listen', () => {
			const result = server.listen(0);
			expect(result).toBe(server);
		});

		it('should validate port number', () => {
			expect(() => {
				// @ts-expect-error Testing invalid input
				server.listen('invalid');
			}).toThrow();
		});

		it('should validate port range', () => {
			expect(() => {
				server.listen(70000);
			}).toThrow();
		});
	});

	describe('Default Command Behaviors', () => {
		it('should handle SHOW DATABASES with databases', () => {
			server.setDatabases(
				{ name: 'wn', description: 'WordNet' },
				{ name: 'gcide', description: 'GCIDE' }
			);

			const writeSpy = jest.spyOn(response, 'writeDatabases');
			
			// Simulate internal dispatch
			server['__handlers']['SHOW DATABASES']?.(
				{ raw: 'SHOW DB', name: 'SHOW DATABASES', parameters: [], syntaxValid: true },
				response
			);

			expect(writeSpy).toHaveBeenCalledWith(server.databases);
		});

		it('should handle SHOW DATABASES without databases', () => {
			const errorSpy = jest.spyOn(response, 'error');
			
			server['__handlers']['SHOW DATABASES']?.(
				{ raw: 'SHOW DB', name: 'SHOW DATABASES', parameters: [], syntaxValid: true },
				response
			);

			expect(errorSpy).toHaveBeenCalledWith(554);
		});

		it('should handle SHOW STRATEGIES with strategies', () => {
			server.setStrategies(
				{ name: 'exact', description: 'Exact match' },
				{ name: 'prefix', description: 'Prefix match' }
			);

			const statusSpy = jest.spyOn(response, 'status');
			
			server['__handlers']['SHOW STRATEGIES']?.(
				{ raw: 'SHOW STRAT', name: 'SHOW STRATEGIES', parameters: [], syntaxValid: true },
				response
			);

			expect(statusSpy).toHaveBeenCalledWith(111, [2]);
		});

		it('should handle SHOW STRATEGIES without strategies', () => {
			const errorSpy = jest.spyOn(response, 'error');
			
			server['__handlers']['SHOW STRATEGIES']?.(
				{ raw: 'SHOW STRAT', name: 'SHOW STRATEGIES', parameters: [], syntaxValid: true },
				response
			);

			expect(errorSpy).toHaveBeenCalledWith(555);
		});

		it('should handle SHOW INFO with valid database', () => {
			server.setDatabaseInfo('wn', 'WordNet info');
			const statusSpy = jest.spyOn(response, 'status');
			
			server['__handlers']['SHOW INFO']?.(
				{ raw: 'SHOW INFO wn', name: 'SHOW INFO', parameters: ['wn'], syntaxValid: true },
				response
			);

			expect(statusSpy).toHaveBeenCalledWith(112);
		});

		it('should handle SHOW INFO with invalid database', () => {
			const errorSpy = jest.spyOn(response, 'error');
			
			server['__handlers']['SHOW INFO']?.(
				{ raw: 'SHOW INFO invalid', name: 'SHOW INFO', parameters: ['invalid'], syntaxValid: true },
				response
			);

			expect(errorSpy).toHaveBeenCalledWith(550);
		});

		it('should handle SHOW SERVER', () => {
			server.setServerInfo('Test server info');
			const statusSpy = jest.spyOn(response, 'status');
			
			server['__handlers']['SHOW SERVER']?.(
				{ raw: 'SHOW SERVER', name: 'SHOW SERVER', parameters: [], syntaxValid: true },
				response
			);

			expect(statusSpy).toHaveBeenCalledWith(114);
		});

		it('should handle OPTION MIME', () => {
			const okSpy = jest.spyOn(response, 'ok');
			
			server['__handlers']['OPTION MIME']?.(
				{ raw: 'OPTION MIME', name: 'OPTION MIME', parameters: [], syntaxValid: true },
				response
			);

			expect(response.optionMimeEnabled).toBe(true);
			expect(okSpy).toHaveBeenCalled();
		});

		it('should handle CLIENT command', () => {
			const okSpy = jest.spyOn(response, 'ok');
			
			server['__handlers']['CLIENT']?.(
				{ raw: 'CLIENT test client', name: 'CLIENT', parameters: ['test', 'client'], syntaxValid: true },
				response
			);

			expect(response.clientText).toBe('test client');
			expect(okSpy).toHaveBeenCalled();
		});

		it('should handle STATUS command', () => {
			const okSpy = jest.spyOn(response, 'ok');
			
			server['__handlers']['STATUS']?.(
				{ raw: 'STATUS', name: 'STATUS', parameters: [], syntaxValid: true },
				response
			);

			expect(okSpy).toHaveBeenCalled();
		});

		it('should handle HELP command', () => {
			const statusSpy = jest.spyOn(response, 'status');
			
			server['__handlers']['HELP']?.(
				{ raw: 'HELP', name: 'HELP', parameters: [], syntaxValid: true },
				response
			);

			expect(statusSpy).toHaveBeenCalledWith(113);
		});

		it('should handle QUIT command', () => {
			const statusSpy = jest.spyOn(response, 'status');
			const closeSpy = jest.spyOn(response, 'close');
			
			server['__handlers']['QUIT']?.(
				{ raw: 'QUIT', name: 'QUIT', parameters: [], syntaxValid: true },
				response
			);

			expect(statusSpy).toHaveBeenCalledWith(221, []);
			expect(closeSpy).toHaveBeenCalled();
		});

		it('should return 502 for DEFINE by default', () => {
			const errorSpy = jest.spyOn(response, 'error');
			
			server['__handlers']['DEFINE']?.(
				{ raw: 'DEFINE db word', name: 'DEFINE', parameters: ['db', 'word'], syntaxValid: true },
				response
			);

			expect(errorSpy).toHaveBeenCalledWith(502);
		});

		it('should return 502 for MATCH by default', () => {
			const errorSpy = jest.spyOn(response, 'error');
			
			server['__handlers']['MATCH']?.(
				{ raw: 'MATCH db strat word', name: 'MATCH', parameters: ['db', 'strat', 'word'], syntaxValid: true },
				response
			);

			expect(errorSpy).toHaveBeenCalledWith(502);
		});

		it('should return 501 for unknown SHOW command', () => {
			const errorSpy = jest.spyOn(response, 'error');
			
			server['__handlers']['SHOW']?.(
				{ raw: 'SHOW UNKNOWN', name: 'SHOW', parameters: ['UNKNOWN'], syntaxValid: true },
				response
			);

			expect(errorSpy).toHaveBeenCalledWith(501);
		});

		it('should return 501 for unknown OPTION command', () => {
			const errorSpy = jest.spyOn(response, 'error');
			
			server['__handlers']['OPTION']?.(
				{ raw: 'OPTION UNKNOWN', name: 'OPTION', parameters: ['UNKNOWN'], syntaxValid: true },
				response
			);

			expect(errorSpy).toHaveBeenCalledWith(501);
		});
	});

	describe('Socket Management', () => {
		it('should track connected sockets', () => {
			return new Promise<void>((resolve) => {
				server.listen(0, () => {
					expect(server.sockets.size).toBe(0);
					resolve();
				});
			});
		});

		it('should clean up sockets on shutdown', async () => {
			await new Promise<void>((resolve) => {
				server.listen(0, resolve);
			});

			// Create a mock socket and add it to the server's socket set
			const mockSock = new Socket();
			// @ts-expect-error: Read-only property
			mockSock.destroyed = false;

			// Add to the set
			server.sockets.add(mockSock);
			
			// Verify it was added
			expect(server.sockets.size).toBe(1);

			// Shutdown should destroy all sockets and clear the set
			await server.shutdown();
			
			expect(mockSock.destroyed).toBeTruthy();
			expect(server.sockets.size).toBe(0);
		});
	});

	describe('Error Handling', () => {
		it('should handle handler errors with default handler', async () => {
			const errorHandler = jest.fn(() => {
				throw new Error('Handler error');
			});
			
			server.define(errorHandler);
			
			const errorSpy = jest.spyOn(response, 'error');
			
			await server['__dispatch'](
				{ raw: 'DEFINE db word', name: 'DEFINE', parameters: ['db', 'word'], syntaxValid: true },
				response
			);

			expect(errorSpy).toHaveBeenCalledWith(420);
		});

		it('should call custom error handler', async () => {
			const customErrorHandler = jest.fn();
			const errorHandler = jest.fn(() => {
				throw new Error('Test error');
			});
			
			server.onHandlerError(customErrorHandler);
			server.define(errorHandler);
			
			await server['__dispatch'](
				{ raw: 'DEFINE db word', name: 'DEFINE', parameters: ['db', 'word'], syntaxValid: true },
				response
			);

			expect(customErrorHandler).toHaveBeenCalled();
			expect(customErrorHandler.mock.calls[0][0]).toBeInstanceOf(Error);
		});

		it('should handle syntax errors', async () => {
			const syntaxSpy = jest.spyOn(response, 'error');
			
			await server['__dispatch'](
				{ raw: 'DEFINE', name: 'DEFINE', parameters: [], syntaxValid: false },
				response
			);

			expect(syntaxSpy).toHaveBeenCalledWith(501);
		});

		it('should handle unknown commands', async () => {
			const errorSpy = jest.spyOn(response, 'error');
			
			await server['__dispatch'](
				{ raw: 'UNKNOWN', name: 'UNKNOWN', parameters: [], syntaxValid: true },
				response
			);

			expect(errorSpy).toHaveBeenCalledWith(500);
		});

		it('should call custom syntax error handler', async () => {
			const customSyntaxHandler = jest.fn();
			server.onSyntaxError(customSyntaxHandler);
			
			await server['__dispatch'](
				{ raw: 'DEFINE', name: 'DEFINE', parameters: [], syntaxValid: false },
				response
			);

			expect(customSyntaxHandler).toHaveBeenCalled();
		});

		it('should call custom unknown command handler', async () => {
			const customUnknownHandler = jest.fn();
			server.onUnknownCommand(customUnknownHandler);
			
			await server['__dispatch'](
				{ raw: 'UNKNOWN', name: 'UNKNOWN', parameters: [], syntaxValid: true },
				response
			);

			expect(customUnknownHandler).toHaveBeenCalled();
		});
	});

	describe('Integration Tests', () => {
		it('should process custom DEFINE handler', async () => {
			const defineHandler = jest.fn((command, res) => {
				res.writeDefinitions([
					{
						headword: command.parameters[1],
						dictionary: command.parameters[0],
						dictionaryDescription: 'Test Dictionary',
						definition: 'Test definition',
						mimeHeaders: {}
					}
				]);
			});

			server.define(defineHandler);

			await server['__dispatch'](
				{ raw: 'DEFINE', name: 'DEFINE', parameters: ['db', 'test'], syntaxValid: true },
				response
			);

			expect(defineHandler).toHaveBeenCalled();
		});

		it('should process custom MATCH handler', async () => {
			const matchHandler = jest.fn((command, res) => {
				res.writeMatches([
					{ word: 'test', dictionary: command.parameters[0] }
				]);
			});

			server.match(matchHandler);

			await server['__dispatch'](
				{ raw: 'MATCH db exact test', name: 'MATCH', parameters: ['db', 'exact', 'test'], syntaxValid: true },
				response
			);

			expect(matchHandler).toHaveBeenCalled();
		});

		it('should call onCommand handler for all commands', async () => {
			const commandHandler = jest.fn();
			server.onCommand(commandHandler);

			await server['__dispatch'](
				{ raw: 'STATUS', name: 'STATUS', parameters: [], syntaxValid: true },
				response
			);

			expect(commandHandler).toHaveBeenCalled();
		});

		it('should override default handlers', () => {
			const customHandler = () => {};
			server.client(customHandler);

			expect(server['__handlers']['CLIENT']).toBe(customHandler);
		});
	});

	describe('Type Validation', () => {
		it('should validate string parameters', () => {
			expect(() => {
				// @ts-expect-error Testing invalid input
				server.setWelcomeText(123);
			}).toThrow();
		});

		it('should validate array parameters', () => {
			expect(() => {
				// @ts-expect-error Testing invalid input
				server.setDatabases('not an array');
			}).toThrow();
		});

		it('should validate function parameters', () => {
			expect(() => {
				// @ts-expect-error Testing invalid input
				server.define('not a function');
			}).toThrow();
		});

		it('should validate command name type', () => {
			expect(() => {
				// @ts-expect-error Testing invalid input
				server.command(123, new Function());
			}).toThrow();
		});
	});
});