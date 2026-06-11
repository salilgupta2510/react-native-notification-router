import { PushToken, TokenChangeHandler } from './types';
export declare class TokenManager {
    private listeners;
    private unsubscribeRefresh;
    getToken(): Promise<PushToken>;
    refreshToken(): Promise<PushToken>;
    onTokenRefresh(handler: TokenChangeHandler): () => void;
    deleteToken(): Promise<void>;
    isTokenValid(token: string): boolean;
    destroy(): void;
}
//# sourceMappingURL=TokenManager.d.ts.map