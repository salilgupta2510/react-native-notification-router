"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useDeepLink = useDeepLink;
const react_1 = require("react");
const NotificationRouter_1 = require("./NotificationRouter");
function useDeepLink() {
    const [state, setState] = (0, react_1.useState)({
        deepLink: null,
        source: null,
    });
    (0, react_1.useEffect)(() => {
        const router = NotificationRouter_1.NotificationRouter.getInstance();
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
    const clearDeepLink = (0, react_1.useCallback)(() => {
        setState({ deepLink: null, source: null });
    }, []);
    return Object.assign(Object.assign({}, state), { clearDeepLink });
}
//# sourceMappingURL=useDeepLink.js.map