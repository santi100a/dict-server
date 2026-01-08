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

describe('Command Serialization', () => {
	it('should process commands in order', async () => {
		const results: number[] = [];

		server.define(async (command, response) => {
			const [, word] = command.parameters;
			const id = Number.parseInt(word);

			// Simulate async work with varying delays
			await new Promise(resolve => setTimeout(resolve, (3 - id) * 10));

			results.push(id);
			response.ok();
		});

		const socket = await connectClient();
		await readUntil(socket, '\r\n'); // consume welcome

		// Send multiple commands rapidly
		socket.write('DEFINE * 1\r\n');
		socket.write('DEFINE * 2\r\n');
		socket.write('DEFINE * 3\r\n');

		await readUntil(socket, '250 ok');
		await readUntil(socket, '250 ok');
		await readUntil(socket, '250 ok');

		// Should execute in order despite different delays
		expect(results).toEqual([1, 2, 3]);
	});

	it('should handle pipelined commands from cURL', async () => {
		let defineCount = 0;

		server.define(async (command, response) => {
			defineCount++;
			response.ok();
		});

		const socket = await connectClient();
		await readUntil(socket, '\r\n'); // consume welcome

		// Simulate cURL sending multiple commands in one write
		socket.write('CLIENT curl 8.0\r\nDEFINE * test\r\nQUIT\r\n');

		await readUntil(socket, '221');

		expect(defineCount).toBe(1);
	});
});
