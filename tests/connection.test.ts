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

describe('Connection', () => {
	it('should send welcome banner on connect', async () => {
		const socket = await connectClient();
		const welcome = await readUntil(socket, '\r\n');
		expect(welcome).toMatch(/^220 /);
		expect(welcome).toContain('welcome');
	});

	it('should allow custom connect handler', async () => {
		const customServer = new DictServer();
		customServer.onConnect(response => {
			response.writeLine('220 Custom welcome');
		});
		customServer.listen(TEST_PORT + 1);

		const socket = new Socket();
		socket.connect(TEST_PORT + 1, '127.0.0.1');
		const welcome = await readUntil(socket, '\r\n');

		expect(welcome).toBe('220 Custom welcome\r\n');

		socket.destroy();
		(customServer as unknown as { __server: Server }).__server.close();
	});
});
