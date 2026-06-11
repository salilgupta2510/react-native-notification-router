import { NotificationPayload } from './types';
export declare class ColdStartHandler {
    getInitialDeepLink(): Promise<string | null>;
    getInitialNotification(): Promise<NotificationPayload | null>;
    extractDeepLink(notification: NotificationPayload): string | null;
    private getNotificationDeepLink;
    private getLinkingInitialUrl;
    private normalizeRemoteMessage;
}
//# sourceMappingURL=ColdStartHandler.d.ts.map