export interface DefinitionHeader {
	readonly HEADWORD: string;
	readonly DICTNAME: string;
	readonly DICTDESC: string;
}
export interface WelcomeBanner {
	readonly TEXT: string;
	readonly CAPABILITIES: string;
	readonly MSGID: string;
}

export const STATUS = {
	// 100 range: something follows
	110: (n: number) => `${n} databases present - text follows`,
	111: (n: number) => `${n} strategies available - text follows`,
	112: () => 'database information follows',
	113: () => 'help text follows',
	114: () => 'server information follows',
	130: () => 'challenge follows',
	150: (n: number) => `${n} definitions retrieved - definitions follow`,
	151: (h: DefinitionHeader) => `"${h.HEADWORD}" ${h.DICTNAME} "${h.DICTDESC}"`,
	152: (n: number) => `${n} matches found - text follows`,

	// 200 range: everything is OK
	210: () => 'status',
	220: (b: WelcomeBanner) => `${b.TEXT} <${b.CAPABILITIES}> <${b.MSGID}>`,
	221: () => 'Closing Connection',
	230: () => 'Authentication successful',
	250: () => 'ok',

	// 300 range: continuation
	330: () => 'send response',

	// 400 range: temporary error
	420: () => 'Server temporarily unavailable',
	421: () => 'Server shutting down at operator request',

	// 500 range: permanent error
	500: () => 'Syntax error, command not recognized',
	501: () => 'Syntax error, illegal parameters',
	502: () => 'Command not implemented',
	503: () => 'Command parameter not implemented',
	530: () => 'Access denied',
	531: () => 'Access denied, use "SHOW INFO" for server information',
	532: () => 'Access denied, unknown mechanism',
	550: () => 'Invalid database, use "SHOW DB" for list of databases',
	551: () => 'Invalid strategy, use "SHOW STRAT" for a list of strategies',
	552: () => 'No match',
	554: () => 'No databases present',
	555: () => 'No strategies available'
} as const;
export type StatusMap = typeof STATUS;
export type StatusCode = keyof StatusMap;

export function statusText<K extends keyof StatusMap>(
	code: K,
	...args: Parameters<StatusMap[K]>
): string;
export function statusText(code: number): string;
export function statusText(code: 110 | 111 | 150 | 152, count: number): string;
export function statusText(code: 151, header: DefinitionHeader): string;
export function statusText(code: 220, banner: WelcomeBanner): string;

export function statusText<K extends keyof StatusMap>(
	code: K | number,
	...args: Parameters<StatusMap[K]>
): string {
	type MessageFunction = (...args: Parameters<StatusMap[K]>) => string;

	const fn =
		(STATUS as Record<number, MessageFunction>)[code] ?? (() => 'Unknown');

	return fn(...args);
}
