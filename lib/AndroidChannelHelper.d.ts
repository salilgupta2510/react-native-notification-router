export declare const IMPORTANCE: {
    readonly NONE: 0;
    readonly MIN: 1;
    readonly LOW: 2;
    readonly DEFAULT: 3;
    readonly HIGH: 4;
};
export type ImportanceLevel = (typeof IMPORTANCE)[keyof typeof IMPORTANCE];
export declare class AndroidChannelHelper {
    static createChannel(channelId: string, name: string, importance?: ImportanceLevel): Promise<string>;
    static createDefaultChannel(name: string): Promise<string>;
    static createSilentChannel(name: string): Promise<string>;
    static createUrgentChannel(name: string): Promise<string>;
}
//# sourceMappingURL=AndroidChannelHelper.d.ts.map