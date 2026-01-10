import type { DictCommand } from './libtypes';
import { tokenize } from './libtokenize';

const SHOW_MAP: Record<string, string> = {
	DB: 'DATABASES',
	DATABASES: 'DATABASES',
	STRAT: 'STRATEGIES',
	STRATEGIES: 'STRATEGIES',
	SERVER: 'SERVER',
	INFO: 'INFO'
};

export function parseCommand(line: string): DictCommand {
	const raw = line;
	const parts = tokenize(raw.trim());

	const name = parts[0].toUpperCase();
	const parameters = parts.slice(1);
    const firstParameter = parameters[0]?.toUpperCase() ?? '';
	// SHOW normalization
	if (
		name === 'SHOW' &&
		Object.keys(SHOW_MAP).includes(firstParameter.toUpperCase())
	) {
		const normalized = SHOW_MAP[firstParameter];
		if (normalized) {
			return {
				raw,
				name: `SHOW ${normalized}`,
				parameters: parameters.slice(1),
                syntaxValid: true
			};
		}
	}

	// OPTION normalization
	if (name === 'OPTION' && parameters[0].toUpperCase() === 'MIME') {
		return {
			raw,
			name: 'OPTION MIME',
			parameters: parameters.slice(1),
            syntaxValid: true
		};
	}

	return {
		raw,
		name,
		parameters,
        syntaxValid: true
	};
}
