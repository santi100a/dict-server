import { type Server, Socket } from 'node:net';
import { DictServer } from '../src/server.class';

jest.setTimeout(20_000);

let server: DictServer;
let client: Socket;
const TEST_PORT = Math.floor(Math.random() * 9999);

beforeEach(() => {
	return new Promise<void>(resolve => {
		server = new DictServer();
		server.listen(TEST_PORT, () => resolve());
	});
});

afterEach(() => {
	return new Promise<void>(resolve => {
		if (client && !client.destroyed) {
			client.destroy();
		}
		// Close server
		(server as unknown as { __server: Server }).__server.close(() => resolve());
	});
});

const connectClient = (): Promise<Socket> => {
	return new Promise(resolve => {
		client = new Socket();
		client.connect(TEST_PORT, '127.0.0.1', () => {
			resolve(client);
		});
	});
};

const readUntil = (socket: Socket, delimiter: string): Promise<string> => {
	return new Promise((resolve, reject) => {
		let buffer = '';
		const onData = (chunk: Buffer) => {
			buffer += chunk.toString();
			if (buffer.includes(delimiter)) {
				socket.off('data', onData);
				socket.off('error', onError);
				resolve(buffer);
			}
		};
		const onError = (err: Error) => {
			socket.off('data', onData);
			socket.off('error', onError);
			reject(err);
		};
		socket.on('data', onData);
		socket.once('error', onError);
	});
};

const sendCommand = async (
	socket: Socket,
	command: string
): Promise<string> => {
	socket.write(command + '\r\n');
	return readUntil(socket, '\r\n');
};

describe('Error Handling', () => {
	it('should call onUnknownCommand for unknown commands', async () => {
		let called = false;
		server.onUnknownCommand((command, response) => {
			called = true;
			response.writeLine('999 Custom unknown error');
		});

		const socket = await connectClient();
		await readUntil(socket, '\r\n'); // consume welcome

		const response = await sendCommand(socket, 'UNKNOWN');
		expect(called).toBe(true);
		expect(response).toBe('999 Custom unknown error\r\n');
	});

	it('should call onSyntaxError for invalid syntax', async () => {
    // Register the syntax error handler with custom message
    server.onSyntaxError((command, response) => {
        response.writeLine('501 Custom syntax error');
    });

    // Register a test command
    server.command('TEST', async (command, response) => {
		if (!command.syntaxValid) {
			response.error(501);
			return;
		}
        response.ok();
    });

    const socket = await connectClient();
    await readUntil(socket, '\r\n'); // consume welcome

    // Send command with mismatched quotes - will trigger syntax error
    socket.write('TEST \'invalid token"\r\n');
    const response = await readUntil(socket, '\r\n');

    socket.destroy();

    expect(response).toContain('501');
    expect(response).toContain('Custom syntax error');
}, 30_000);

	it('should call onHandlerError when handler throws', async () => {
		let errorCaught = false;

		server.onHandlerError((error, response) => {
			errorCaught = true;
			response.writeLine('555 Custom error handler');
		});

		server.define(async () => {
			throw new Error('Test error');
		});

		const socket = await connectClient();
		await readUntil(socket, '\r\n'); // consume welcome

		const response = await sendCommand(socket, 'DEFINE * test');
		expect(errorCaught).toBe(true);
		expect(response).toBe('555 Custom error handler\r\n');
	});
});
