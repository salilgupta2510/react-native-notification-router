import { useEffect, useState, useCallback } from 'react';
import { DeepLinkSource } from './types';
import { NotificationRouter } from './NotificationRouter';

interface DeepLinkState {
  deepLink: string | null;
  source: DeepLinkSource | null;
}

export function useDeepLink(): DeepLinkState & { clearDeepLink: () => void } {
  const [state, setState] = useState<DeepLinkState>({
    deepLink: null,
    source: null,
  });

  useEffect(() => {
    const router = NotificationRouter.getInstance();

    const unsubscribe = router.onDeepLink((url, source) => {
      setState({ deepLink: url, source });
    });

    let cancelled = false;
    router.getColdStartDeepLink().then((url) => {
      if (!cancelled && url) {
        setState({ deepLink: url, source: 'notification' });
      }
    });

    return () => {
      cancelled = true;
      unsubscribe();
    };
  }, []);

  const clearDeepLink = useCallback(() => {
    setState({ deepLink: null, source: null });
  }, []);

  return { ...state, clearDeepLink };
}
