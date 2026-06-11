// eslint-disable-next-line @typescript-eslint/no-explicit-any
let notifee: any = null;
try {
  notifee = require('@notifee/react-native').default;
} catch {
  // optional peer dependency
}

export const IMPORTANCE = {
  NONE: 0,
  MIN: 1,
  LOW: 2,
  DEFAULT: 3,
  HIGH: 4,
} as const;

export type ImportanceLevel = (typeof IMPORTANCE)[keyof typeof IMPORTANCE];

export class AndroidChannelHelper {
  static async createChannel(
    channelId: string,
    name: string,
    importance: ImportanceLevel = IMPORTANCE.DEFAULT
  ): Promise<string> {
    if (!notifee) {
      console.warn('[react-native-notification-router] @notifee/react-native not installed. Android channels skipped.');
      return channelId;
    }
    return notifee.createChannel({ id: channelId, name, importance });
  }

  static async createDefaultChannel(name: string): Promise<string> {
    return AndroidChannelHelper.createChannel(`${name.toLowerCase().replace(/\s+/g, '_')}_default`, name, IMPORTANCE.DEFAULT);
  }

  static async createSilentChannel(name: string): Promise<string> {
    return AndroidChannelHelper.createChannel(`${name.toLowerCase().replace(/\s+/g, '_')}_silent`, name, IMPORTANCE.LOW);
  }

  static async createUrgentChannel(name: string): Promise<string> {
    return AndroidChannelHelper.createChannel(`${name.toLowerCase().replace(/\s+/g, '_')}_urgent`, name, IMPORTANCE.HIGH);
  }
}
