export interface AndroidChannelConfig {
  channelId: string;
  channelName: string;
  importance?: number;
  sound?: string;
  vibration?: boolean;
}

export interface NotificationRouterConfig {
  android?: AndroidChannelConfig;
  ios?: {
    requestPermissions?: boolean;
  };
  onDeepLink?: (url: string, source: DeepLinkSource) => void;
  onTokenChange?: TokenChangeHandler;
  onError?: (error: Error) => void;
}

export interface PushToken {
  fcm?: string;
  apns?: string;
}

export interface NotificationPayload {
  id?: string;
  title?: string;
  body?: string;
  data?: Record<string, string>;
  deepLink?: string;
}

export type DeepLinkSource = 'notification' | 'linking';
export type TokenChangeHandler = (token: PushToken) => void;
export type DeepLinkHandler = (url: string, source: DeepLinkSource) => void;
export type RouterEvent = 'token' | 'notification' | 'deep_link' | 'error';
