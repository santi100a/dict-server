import type { Socket } from 'node:net';

export function createLineReader(socket: Socket) {
	let buffer = '';
	let ended = false;
	let destroyed = false;

	const lineQueue: string[] = [];
	const waiterQueue: Array<{
		resolve: (value: string | null) => void;
		reject: (error: Error) => void;
	}> = [];

	const processBuffer = () => {
		let idx: number;

		// Support both CRLF and LF line endings
		while ((idx = buffer.indexOf('\n')) !== -1) {
			let line = buffer.slice(0, idx);
			buffer = buffer.slice(idx + 1);

			// Strip trailing \r if present
			if (line.endsWith('\r')) line = line.slice(0, -1);

			const waiter = waiterQueue.shift();
			if (waiter) {
				waiter.resolve(line);
			} else {
				lineQueue.push(line);
			}
		}
	};

	const onData = (chunk: Buffer) => {
		if (destroyed) return;
		buffer += chunk.toString('utf8');
		processBuffer();
	};

	const onError = (error: Error) => {
		destroyed = true;
		while (waiterQueue.length > 0) {
			const waiter = waiterQueue.shift()!;
			waiter.reject(error);
		}
	};

	const onEnd = () => {
		ended = true;

		// Flush any leftover data as a line
		if (buffer.length > 0) {
			lineQueue.push(buffer);
			buffer = '';
		}

		processBuffer();

		while (waiterQueue.length > 0) {
			const waiter = waiterQueue.shift()!;
			const line = lineQueue.shift() ?? null;
			waiter.resolve(line);
		}
	};

	const onClose = () => {
		destroyed = true;
		while (waiterQueue.length > 0) {
			const waiter = waiterQueue.shift()!;
			waiter.reject(new Error('Socket closed'));
		}
	};

	// Attach events
	socket.on('data', onData);
	socket.on('error', err => {
		// Ignore ECONNRESET from clients disconnecting abruptly
		if ((err as NodeJS.ErrnoException).code === 'ECONNRESET') return;
		onError(err);
	});
	socket.once('end', onEnd);
	socket.once('close', onClose);

	// The actual readLine function
	return function readLine(): Promise<string | null> {
		return new Promise((resolve, reject) => {
			if (destroyed) {
				reject(new Error('Socket destroyed'));
				return;
			}

			// If a line is already buffered, return it immediately
			if (lineQueue.length > 0) {
				resolve(lineQueue.shift()!);
				return;
			}

			// If socket ended, return null
			if (ended) {
				resolve(null);
				return;
			}

			// Otherwise, wait for data
			waiterQueue.push({ resolve, reject });
		});
	};
}
