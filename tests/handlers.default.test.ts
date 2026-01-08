import { type Server, Socket } from 'node:net';
import { DictServer } from '../src/server.class';

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

describe('Default Handlers', () => {
	it('should handle CLIENT command', async () => {
		const socket = await connectClient();
		await readUntil(socket, '\r\n'); // consume welcome

		const response = await sendCommand(socket, 'CLIENT test 1.0');
		expect(response).toMatch(/^250 ok/);
	});

	it('should handle QUIT command', async () => {
		const socket = await connectClient();
		await readUntil(socket, '\r\n'); // consume welcome

		socket.write('QUIT\r\n');
		const response = await readUntil(socket, '\r\n');
		expect(response).toMatch(/^221 /);
	});

	it('should handle HELP command', async () => {
		const socket = await connectClient();
		await readUntil(socket, '\r\n'); // consume welcome

		socket.write('HELP\r\n');
		const response = await readUntil(socket, '250 ok');
		expect(response).toContain('113');
		expect(response).toContain('DEFINE');
		expect(response).toContain('MATCH');
	});

	it('should handle STATUS command', async () => {
		const socket = await connectClient();
		await readUntil(socket, '\r\n'); // consume welcome

		const response = await sendCommand(socket, 'STATUS');
		expect(response).toMatch(/^250 ok/);
	});

	it('should return 502 for unimplemented DEFINE by default', async () => {
		const socket = await connectClient();
		await readUntil(socket, '\r\n'); // consume welcome

		const response = await sendCommand(socket, 'DEFINE * test');
		expect(response).toMatch(/^502 /);
	});

	it('should return 500 for unknown commands', async () => {
		const socket = await connectClient();
		await readUntil(socket, '\r\n'); // consume welcome

		const response = await sendCommand(socket, 'INVALID');
		expect(response).toMatch(/^500 /);
	});
});
