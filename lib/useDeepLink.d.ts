import { DeepLinkSource } from './types';
interface DeepLinkState {
    deepLink: string | null;
    source: DeepLinkSource | null;
}
export declare function useDeepLink(): DeepLinkState & {
    clearDeepLink: () => void;
};
export {};
//# sourceMappingURL=useDeepLink.d.ts.map