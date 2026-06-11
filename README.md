# react-native-notification-router

[![npm version](https://img.shields.io/npm/v/react-native-notification-router.svg)](https://www.npmjs.com/package/react-native-notification-router)
[![npm downloads](https://img.shields.io/npm/dm/react-native-notification-router.svg)](https://www.npmjs.com/package/react-native-notification-router)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
![Platform](https://img.shields.io/badge/platform-iOS%20%7C%20Android-lightgrey.svg)

Unified push notification + deep link routing for React Native. Handles FCM token lifecycle, APNs permissions, Android channel setup, cold-start deep links, and foreground notification routing — through a single `configure()` call or a single hook.

## The problem this solves

Setting up push notifications in a production React Native app requires coordinating at least four separate concerns:

1. **FCM token registration** — get the token, handle refresh, delete on logout
2. **iOS permissions** — request at the right time, handle denial gracefully
3. **Android notification channels** — required since Android 8, easy to forget
4. **Cold-start deep links** — when a user taps a notification that opens a killed app, the link is attached to the initial message, not to `Linking.getInitialURL()` — unless you check both

The documentation for each step is spread across the Firebase, Notifee, and React Navigation docs. This package wires all of it together.

## Installation

```bash
npm install react-native-notification-router
```

Peer dependencies (install the ones you use):

```bash
# For FCM push notifications (both platforms)
npm install @react-native-firebase/app @react-native-firebase/messaging

# For Android channels and foreground display
npm install @notifee/react-native
```

Both peer dependencies are optional — the package won't crash if they're not installed. You'll get a console warning and the relevant feature will be skipped.

## Quick start

```tsx
// App.tsx
import { useNotificationRouter } from 'react-native-notification-router';
import { useNavigationContainerRef } from '@react-navigation/native';

export default function App() {
  const navigationRef = useNavigationContainerRef();

  const { token, lastDeepLink, isReady, error } = useNotificationRouter({
    android: {
      channelId: 'default',
      channelName: 'Notifications',
      importance: 4, // HIGH
    },
    ios: {
      requestPermissions: true,
    },
    onDeepLink: (url, source) => {
      // source is 'notification' | 'linking'
      navigationRef.current?.navigate(parseRoute(url));
    },
    onTokenChange: ({ fcm, apns }) => {
      // Send updated token to your server
      api.updatePushToken({ fcm, apns });
    },
  });

  return (
    <NavigationContainer ref={navigationRef}>
      {/* ... */}
    </NavigationContainer>
  );
}
```

That's it. No separate `useEffect` for token registration, no separate listener for `Linking`, no manual channel creation.

## Cold-start deep links

This is the tricky case. When a user's app is completely killed and they tap a push notification, the deep link URL is attached to the notification's initial message — it's not available through `Linking.getInitialURL()` alone.

`useNotificationRouter` checks both sources on mount:

```
App launched from tap on push notification
  → getInitialNotification() → extract data.deepLink
  → if not found, fall back to Linking.getInitialURL()
  → emit via onDeepLink callback with source = 'notification'
```

You can also call this imperatively after configure resolves:

```typescript
const deepLink = await NotificationRouter.getInstance().getColdStartDeepLink();
```

## API

### useNotificationRouter(config)

The primary hook. Call once at your app root. Returns:

```typescript
{
  token: PushToken | null;        // { fcm?: string; apns?: string }
  lastDeepLink: string | null;    // most recent deep link URL
  lastDeepLinkSource: 'notification' | 'linking' | null;
  isReady: boolean;               // true after configure() resolves
  error: Error | null;
}
```

### useDeepLink()

Subscribe to deep links from anywhere in the component tree without re-configuring:

```typescript
function ProductScreen() {
  const { deepLink, source, clearDeepLink } = useDeepLink();

  useEffect(() => {
    if (deepLink?.startsWith('/product/')) {
      const id = deepLink.split('/').pop();
      loadProduct(id);
      clearDeepLink();
    }
  }, [deepLink]);
}
```

### NotificationRouter (singleton)

```typescript
const router = NotificationRouter.getInstance();

await router.configure(config);

// Subscribe to events
const unsubToken = router.onTokenChange(({ fcm, apns }) => { /* ... */ });
const unsubLink = router.onDeepLink((url, source) => { /* ... */ });

// Get current state
const token = await router.getToken();
const coldStartLink = await router.getColdStartDeepLink();

// Cleanup (call in app teardown if needed)
router.destroy();
unsubToken();
unsubLink();
```

### AndroidChannelHelper

Convenience methods for creating Notifee channels:

```typescript
import { AndroidChannelHelper, IMPORTANCE } from 'react-native-notification-router';

// Custom channel
await AndroidChannelHelper.createChannel('orders', 'Order Updates', IMPORTANCE.HIGH);

// Preset channels
await AndroidChannelHelper.createDefaultChannel('Promotions');
await AndroidChannelHelper.createSilentChannel('Background Sync');
await AndroidChannelHelper.createUrgentChannel('Alerts');
```

### Configuration reference

```typescript
interface NotificationRouterConfig {
  android?: {
    channelId: string;
    channelName: string;
    importance?: 0 | 1 | 2 | 3 | 4; // NONE=0 MIN=1 LOW=2 DEFAULT=3 HIGH=4
    sound?: string;
    vibration?: boolean;
  };
  ios?: {
    requestPermissions?: boolean; // default: true
  };
  onDeepLink?: (url: string, source: 'notification' | 'linking') => void;
  onTokenChange?: (token: { fcm?: string; apns?: string }) => void;
  onError?: (error: Error) => void;
}
```

## Token management

FCM tokens can change. The three cases where this happens:

- **App reinstall** — always generates a new token
- **Data cleared** — Android only, clears token
- **Firebase rotates it** — rare but happens

The package listens for token refresh events from `@react-native-firebase/messaging` and emits them through `onTokenChange`. Your server integration should always use the latest token, not a cached one from registration.

```typescript
router.onTokenChange(async ({ fcm }) => {
  if (fcm) await api.updatePushToken(fcm);
});
```

## Troubleshooting

**iOS: notifications arrive but no permission prompt appeared**

`requestPermissions: true` triggers the system dialog. It can only fire once — iOS will remember the user's choice. If it was already denied, `requestPermission()` returns `DENIED` silently. Check Settings > Notifications.

**Android: no notification shown for foreground messages**

Firebase messaging on Android does not display a notification for messages received while the app is in the foreground. You need Notifee to display it. Add `@notifee/react-native` and handle the `onMessage` event — or use a data-only message and show your own UI.

**Cold-start link fires twice**

This happens if you subscribe to `onDeepLink` before and after `configure()` resolves. Use `useNotificationRouter` which handles the subscription lifecycle, or call `getColdStartDeepLink()` once after configure.

## License

MIT © Salil Gupta
