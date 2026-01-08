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

describe('Custom Handlers', () => {
	it('should allow custom DEFINE handler', async () => {
		server.define(async (command, response) => {
			const [db, word] = command.parameters;
			response.writeLine(`150 1 definitions retrieved`);
			response.writeLine(`151 "${word}" ${db} "${db}"`);
			response.writeLine('Test definition');
			response.writeLine('.');
			response.ok();
		});

		const socket = await connectClient();
		await readUntil(socket, '\r\n'); // consume welcome

		socket.write('DEFINE * test\r\n');
		const response = await readUntil(socket, '250 ok');

		expect(response).toContain('150 1 definitions retrieved');
		expect(response).toContain('151 "test" * "*"');
		expect(response).toContain('Test definition');
	});

	it('should allow custom MATCH handler', async () => {
		server.match(async (command, response) => {
			response.writeLine('152 1 matches found');
			response.writeLine('test');
			response.writeLine('.');
			response.ok();
		});

		const socket = await connectClient();
		await readUntil(socket, '\r\n'); // consume welcome

		socket.write('MATCH * . test\r\n');
		const response = await readUntil(socket, '250 ok');

		expect(response).toContain('152 1 matches found');
		expect(response).toContain('test');
	});

	it('should allow custom command handlers', async () => {
		server.command('CUSTOM', async (command, response) => {
			response.writeLine('200 Custom response');
		});

		const socket = await connectClient();
		await readUntil(socket, '\r\n'); // consume welcome

		const response = await sendCommand(socket, 'CUSTOM');
		expect(response).toBe('200 Custom response\r\n');
	});
});
