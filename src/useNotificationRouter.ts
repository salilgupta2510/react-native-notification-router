import { useEffect, useState, useRef } from 'react';
import { NotificationRouterConfig, PushToken, DeepLinkSource } from './types';
import { NotificationRouter } from './NotificationRouter';

interface NotificationRouterState {
  token: PushToken | null;
  lastDeepLink: string | null;
  lastDeepLinkSource: DeepLinkSource | null;
  isReady: boolean;
  error: Error | null;
}

export function useNotificationRouter(config: NotificationRouterConfig): NotificationRouterState {
  const [state, setState] = useState<NotificationRouterState>({
    token: null,
    lastDeepLink: null,
    lastDeepLinkSource: null,
    isReady: false,
    error: null,
  });

  const configRef = useRef(config);
  configRef.current = config;

  useEffect(() => {
    const router = NotificationRouter.getInstance();
    const cleanups: Array<() => void> = [];

    async function setup() {
      try {
        await router.configure(configRef.current);

        const token = await router.getToken();
        setState((s) => ({ ...s, token, isReady: true }));

        cleanups.push(
          router.onTokenChange((t) => setState((s) => ({ ...s, token: t })))
        );

        cleanups.push(
          router.onDeepLink((url, source) =>
            setState((s) => ({ ...s, lastDeepLink: url, lastDeepLinkSource: source }))
          )
        );

        const coldLink = await router.getColdStartDeepLink();
        if (coldLink) {
          setState((s) => ({ ...s, lastDeepLink: coldLink, lastDeepLinkSource: 'notification' }));
        }
      } catch (e) {
        const error = e instanceof Error ? e : new Error(String(e));
        setState((s) => ({ ...s, error, isReady: false }));
      }
    }

    setup();

    return () => {
      cleanups.forEach((fn) => fn());
    };
  }, []);

  return state;
}
