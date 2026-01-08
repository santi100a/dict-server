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
export declare const STATUS: {
    readonly 110: (n: number) => string;
    readonly 111: (n: number) => string;
    readonly 112: () => string;
    readonly 113: () => string;
    readonly 114: () => string;
    readonly 130: () => string;
    readonly 150: (n: number) => string;
    readonly 151: (h: DefinitionHeader) => string;
    readonly 152: (n: number) => string;
    readonly 210: () => string;
    readonly 220: (b: WelcomeBanner) => string;
    readonly 221: () => string;
    readonly 230: () => string;
    readonly 250: () => string;
    readonly 330: () => string;
    readonly 420: () => string;
    readonly 421: () => string;
    readonly 500: () => string;
    readonly 501: () => string;
    readonly 502: () => string;
    readonly 503: () => string;
    readonly 530: () => string;
    readonly 531: () => string;
    readonly 532: () => string;
    readonly 550: () => string;
    readonly 551: () => string;
    readonly 552: () => string;
    readonly 554: () => string;
    readonly 555: () => string;
};
export type StatusMap = typeof STATUS;
export type StatusCode = keyof StatusMap;
export declare function statusText<K extends keyof StatusMap>(code: K, ...args: Parameters<StatusMap[K]>): string;
export declare function statusText(code: number): string;
export declare function statusText(code: 110 | 111 | 150 | 152, count: number): string;
export declare function statusText(code: 151, header: DefinitionHeader): string;
export declare function statusText(code: 220, banner: WelcomeBanner): string;
