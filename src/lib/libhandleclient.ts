import type { Socket } from 'node:net';
import type { DictResponse } from '../response.class';
import type { DictCommand } from './libtypes';

import { parseCommand } from './libparsecommand';
import { createLineReader } from './libreadline';

export async function handleClient(
	socket: Socket,
	onCommand: (cmd: DictCommand, res: DictResponse) => unknown,
	response: DictResponse
) {
	const readLine = createLineReader(socket);

	while (!socket.destroyed) {
		const line = await readLine();

		if (line === null) break;

		if (!line.trim()) {
			continue;
		}
		if (line.length > 1024) {
			// Line too long - invalid!
			await onCommand(
				{
					raw: line.split('').slice(0, 1024).join(''),
					name: '',
					parameters: [],
					syntaxValid: false
				},
				response
			);
			continue;
		}

		let command: DictCommand;

		try {
			command = parseCommand(line);
		} catch {
			// Parsing error → invalid command
			await onCommand(
				{
					raw: line,
					name: '',
					parameters: [],
					syntaxValid: false
				},
				response
			);
			continue;
		}

		await onCommand(command, response);
		// Break after QUIT command
        if (command.name === 'QUIT') {
            break;
        }
	}
}
