export function dotStuff(input: string): string {
	// Replace <CRLF>.<CRLF>
    return input.replace(/(^|\r\n)\./g, '$1..');
}