import { NotificationRouterConfig, PushToken, DeepLinkSource } from './types';
interface NotificationRouterState {
    token: PushToken | null;
    lastDeepLink: string | null;
    lastDeepLinkSource: DeepLinkSource | null;
    isReady: boolean;
    error: Error | null;
}
export declare function useNotificationRouter(config: NotificationRouterConfig): NotificationRouterState;
export {};
//# sourceMappingURL=useNotificationRouter.d.ts.map