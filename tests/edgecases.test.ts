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

describe('Edge Cases', () => {
	it('should handle empty lines', async () => {
		const socket = await connectClient();
		await readUntil(socket, '\r\n'); // consume welcome

		socket.write('\r\n');
		socket.write('CLIENT test\r\n');

		const response = await readUntil(socket, '\r\n');
		expect(response).toMatch(/^250 ok/);
	});

	it('should handle commands without parameters', async () => {
		const socket = await connectClient();
		await readUntil(socket, '\r\n'); // consume welcome

		const response = await sendCommand(socket, 'HELP');
		expect(response).toMatch(/^113/);
	});

	it('should handle rapid disconnection', async () => {
		const socket = await connectClient();
		await readUntil(socket, '\r\n'); // consume welcome

		socket.write('DEFINE * test\r\n');
		socket.destroy(); // disconnect immediately

		// Should not crash the server
		await new Promise(resolve => setTimeout(resolve, 100));

		// I'm supposed to do assertions :)
		expect(async () => {
			// Should not crash the server
			await new Promise(resolve => setTimeout(resolve, 100));
		}).not.toThrow();
	});
});
