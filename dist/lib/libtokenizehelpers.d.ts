export type QuotationMark = "'" | '"';
export declare function handleQuotedChar(char: string, quote: QuotationMark | null, current: string): {
    quote: QuotationMark | null;
    current: string;
};
export declare function isOpeningQuote(char: string): boolean;
export declare function isWhitespace(char: string): boolean;
