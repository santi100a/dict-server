export function lfToCrlf(input: string): string {
    return input.replace(/\r\n/g, '\n')   // normalize first
                .replace(/\n/g, '\r\n');  // re-expand
}
