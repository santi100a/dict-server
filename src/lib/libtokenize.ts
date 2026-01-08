import {
	handleQuotedChar,
	isOpeningQuote,
	isWhitespace,
	type QuotationMark
} from './libtokenizehelpers';

export function tokenize(line: string): string[] {
	const tokens: string[] = [];
	let current = '';
	let quote: QuotationMark | null = null;

	for (const char of line.split('')) {
		if (quote) {
			const result = handleQuotedChar(char, quote, current);
			quote = result.quote;
			current = result.current;
			continue;
		}

		if (isOpeningQuote(char)) {
			quote = char as QuotationMark;
			continue;
		}

		if (isWhitespace(char)) {
			if (current.length > 0) {
				tokens.push(current);
				current = '';
			}
			continue;
		}

		current += char;
	}

	if (quote) {
		throw new Error('Unterminated quoted string');
	}

	if (current.length > 0) {
		tokens.push(current);
	}

	return tokens;
}
