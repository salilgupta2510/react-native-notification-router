import { PushToken, TokenChangeHandler } from './types';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let messaging: any = null;
try {
  messaging = require('@react-native-firebase/messaging').default;
} catch {
  // optional peer dependency not installed
}

export class TokenManager {
  private listeners: TokenChangeHandler[] = [];
  private unsubscribeRefresh: (() => void) | null = null;

  async getToken(): Promise<PushToken> {
    const token: PushToken = {};
    if (!messaging) return token;

    try {
      token.fcm = await messaging().getToken();
    } catch (e) {
      // token unavailable
    }

    try {
      token.apns = await messaging().getAPNSToken() ?? undefined;
    } catch {
      // APNs only available on iOS
    }

    return token;
  }

  async refreshToken(): Promise<PushToken> {
    if (!messaging) return {};
    try {
      await messaging().deleteToken();
    } catch {
      // ignore
    }
    return this.getToken();
  }

  onTokenRefresh(handler: TokenChangeHandler): () => void {
    this.listeners.push(handler);

    if (!this.unsubscribeRefresh && messaging) {
      this.unsubscribeRefresh = messaging().onTokenRefresh(async () => {
        const token = await this.getToken();
        this.listeners.forEach((l) => l(token));
      });
    }

    return () => {
      this.listeners = this.listeners.filter((l) => l !== handler);
    };
  }

  async deleteToken(): Promise<void> {
    if (!messaging) return;
    try {
      await messaging().deleteToken();
    } catch {
      // ignore
    }
  }

  isTokenValid(token: string): boolean {
    return typeof token === 'string' && token.length > 10;
  }

  destroy(): void {
    this.listeners = [];
    if (this.unsubscribeRefresh) {
      this.unsubscribeRefresh();
      this.unsubscribeRefresh = null;
    }
  }
}
