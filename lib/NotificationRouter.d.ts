import { NotificationRouterConfig, PushToken, DeepLinkHandler, TokenChangeHandler } from './types';
export declare class NotificationRouter {
    private static _instance;
    private config;
    private tokenManager;
    private coldStartHandler;
    private deepLinkListeners;
    private tokenListeners;
    private linkingSubscription;
    private messagingUnsubscribe;
    private initialized;
    static getInstance(): NotificationRouter;
    configure(config: NotificationRouterConfig): Promise<void>;
    getToken(): Promise<PushToken>;
    onTokenChange(handler: TokenChangeHandler): () => void;
    onDeepLink(handler: DeepLinkHandler): () => void;
    getColdStartDeepLink(): Promise<string | null>;
    handleBackgroundMessage(): void;
    isReady(): boolean;
    destroy(): void;
    private setupLinkingListener;
    private setupForegroundNotificationListener;
    private emitDeepLink;
}
//# sourceMappingURL=NotificationRouter.d.ts.map