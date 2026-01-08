export type QuotationMark = "'" | '"';

export function handleQuotedChar(char: string, quote: QuotationMark | null, current: string): { quote: QuotationMark | null; current: string } {
    if (quote) {
        if (char === quote) {
            return { quote: null, current };
        }
        return { quote, current: current + char };
    }
    return { quote, current };
}

export function isOpeningQuote(char: string): boolean {
    return ['"', "'"].includes(char);
}

export function isWhitespace(char: string): boolean {
    return /\s/.test(char);
}