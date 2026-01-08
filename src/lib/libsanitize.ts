export function sanitize(input: string): string {
	// Remove CR and LF characters
	return input.replace(/[\r\n]/g, '');
}
