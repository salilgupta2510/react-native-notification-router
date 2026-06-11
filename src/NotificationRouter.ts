import { NotificationRouterConfig, PushToken, DeepLinkHandler, TokenChangeHandler } from './types';
import { TokenManager } from './TokenManager';
import { ColdStartHandler } from './ColdStartHandler';
import { AndroidChannelHelper } from './AndroidChannelHelper';

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

export class NotificationRouter {
  private static _instance: NotificationRouter | null = null;

  private config: NotificationRouterConfig = {};
  private tokenManager = new TokenManager();
  private coldStartHandler = new ColdStartHandler();
  private deepLinkListeners: DeepLinkHandler[] = [];
  private tokenListeners: TokenChangeHandler[] = [];
  private linkingSubscription: (() => void) | null = null;
  private messagingUnsubscribe: (() => void) | null = null;
  private initialized = false;

  static getInstance(): NotificationRouter {
    if (!NotificationRouter._instance) {
      NotificationRouter._instance = new NotificationRouter();
    }
    return NotificationRouter._instance;
  }

  async configure(config: NotificationRouterConfig): Promise<void> {
    this.config = config;

    if (config.android) {
      await AndroidChannelHelper.createChannel(
        config.android.channelId,
        config.android.channelName,
        config.android.importance as (0 | 1 | 2 | 3 | 4) | undefined
      );
    }

    if (config.ios?.requestPermissions !== false && messaging) {
      try {
        await messaging().requestPermission();
      } catch {
        // iOS permission denied
      }
    }

    if (config.onTokenChange) {
      this.onTokenChange(config.onTokenChange);
    }

    this.tokenManager.onTokenRefresh((token) => {
      this.tokenListeners.forEach((l) => l(token));
    });

    this.setupLinkingListener();
    this.setupForegroundNotificationListener();

    this.initialized = true;
  }

  async getToken(): Promise<PushToken> {
    return this.tokenManager.getToken();
  }

  onTokenChange(handler: TokenChangeHandler): () => void {
    this.tokenListeners.push(handler);
    return () => {
      this.tokenListeners = this.tokenListeners.filter((l) => l !== handler);
    };
  }

  onDeepLink(handler: DeepLinkHandler): () => void {
    this.deepLinkListeners.push(handler);
    return () => {
      this.deepLinkListeners = this.deepLinkListeners.filter((l) => l !== handler);
    };
  }

  async getColdStartDeepLink(): Promise<string | null> {
    return this.coldStartHandler.getInitialDeepLink();
  }

  handleBackgroundMessage(): void {
    if (!messaging) return;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    messaging().setBackgroundMessageHandler(async (_remoteMessage: any) => {
      // Background messages are handled by the OS notification tray.
      // Deep links from taps are captured via getInitialNotification on next foreground.
    });
  }

  isReady(): boolean {
    return this.initialized;
  }

  destroy(): void {
    this.deepLinkListeners = [];
    this.tokenListeners = [];
    this.tokenManager.destroy();
    if (this.linkingSubscription) {
      this.linkingSubscription();
      this.linkingSubscription = null;
    }
    if (this.messagingUnsubscribe) {
      this.messagingUnsubscribe();
      this.messagingUnsubscribe = null;
    }
    this.initialized = false;
    NotificationRouter._instance = null;
  }

  private setupLinkingListener(): void {
    if (!Linking) return;
    const subscription = Linking.addEventListener('url', ({ url }: { url: string }) => {
      this.emitDeepLink(url, 'linking');
    });
    this.linkingSubscription = () => subscription?.remove?.();
  }

  private setupForegroundNotificationListener(): void {
    if (!messaging) return;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    this.messagingUnsubscribe = messaging().onMessage(async (remoteMessage: any) => {
      const deepLink =
        remoteMessage?.data?.deepLink ??
        remoteMessage?.data?.deep_link ??
        remoteMessage?.data?.url ??
        remoteMessage?.data?.link;
      if (deepLink) {
        this.emitDeepLink(deepLink, 'notification');
      }
    });
  }

  private emitDeepLink(url: string, source: 'notification' | 'linking'): void {
    this.deepLinkListeners.forEach((l) => l(url, source));
    this.config.onDeepLink?.(url, source);
  }
}
