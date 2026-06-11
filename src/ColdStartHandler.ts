import { NotificationPayload } from './types';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let messaging: any = null;
try {
  messaging = require('@react-native-firebase/messaging').default;
} catch {
  // optional peer dependency
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let Linking: any = null;
try {
  Linking = require('react-native').Linking;
} catch {
  // peer dependency
}

export class ColdStartHandler {
  async getInitialDeepLink(): Promise<string | null> {
    const [notifLink, linkingUrl] = await Promise.all([
      this.getNotificationDeepLink(),
      this.getLinkingInitialUrl(),
    ]);
    return notifLink ?? linkingUrl;
  }

  async getInitialNotification(): Promise<NotificationPayload | null> {
    if (!messaging) return null;
    try {
      const remoteMessage = await messaging().getInitialNotification();
      if (!remoteMessage) return null;
      return this.normalizeRemoteMessage(remoteMessage);
    } catch {
      return null;
    }
  }

  extractDeepLink(notification: NotificationPayload): string | null {
    if (notification.deepLink) return notification.deepLink;
    const data = notification.data ?? {};
    return data['deepLink'] ?? data['deep_link'] ?? data['url'] ?? data['link'] ?? null;
  }

  private async getNotificationDeepLink(): Promise<string | null> {
    const notification = await this.getInitialNotification();
    if (!notification) return null;
    return this.extractDeepLink(notification);
  }

  private async getLinkingInitialUrl(): Promise<string | null> {
    if (!Linking) return null;
    try {
      return await Linking.getInitialURL();
    } catch {
      return null;
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private normalizeRemoteMessage(msg: any): NotificationPayload {
    return {
      id: msg.messageId,
      title: msg.notification?.title,
      body: msg.notification?.body,
      data: msg.data,
      deepLink: msg.data?.deepLink ?? msg.data?.deep_link ?? msg.data?.url ?? msg.data?.link,
    };
  }
}
