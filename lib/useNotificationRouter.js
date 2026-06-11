"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useNotificationRouter = useNotificationRouter;
const react_1 = require("react");
const NotificationRouter_1 = require("./NotificationRouter");
function useNotificationRouter(config) {
    const [state, setState] = (0, react_1.useState)({
        token: null,
        lastDeepLink: null,
        lastDeepLinkSource: null,
        isReady: false,
        error: null,
    });
    const configRef = (0, react_1.useRef)(config);
    configRef.current = config;
    (0, react_1.useEffect)(() => {
        const router = NotificationRouter_1.NotificationRouter.getInstance();
        const cleanups = [];
        async function setup() {
            try {
                await router.configure(configRef.current);
                const token = await router.getToken();
                setState((s) => (Object.assign(Object.assign({}, s), { token, isReady: true })));
                cleanups.push(router.onTokenChange((t) => setState((s) => (Object.assign(Object.assign({}, s), { token: t })))));
                cleanups.push(router.onDeepLink((url, source) => setState((s) => (Object.assign(Object.assign({}, s), { lastDeepLink: url, lastDeepLinkSource: source })))));
                const coldLink = await router.getColdStartDeepLink();
                if (coldLink) {
                    setState((s) => (Object.assign(Object.assign({}, s), { lastDeepLink: coldLink, lastDeepLinkSource: 'notification' })));
                }
            }
            catch (e) {
                const error = e instanceof Error ? e : new Error(String(e));
                setState((s) => (Object.assign(Object.assign({}, s), { error, isReady: false })));
            }
        }
        setup();
        return () => {
            cleanups.forEach((fn) => fn());
        };
    }, []);
    return state;
}
//# sourceMappingURL=useNotificationRouter.js.map