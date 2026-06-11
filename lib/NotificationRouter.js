"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationRouter = void 0;
const TokenManager_1 = require("./TokenManager");
const ColdStartHandler_1 = require("./ColdStartHandler");
const AndroidChannelHelper_1 = require("./AndroidChannelHelper");
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let messaging = null;
try {
    messaging = require('@react-native-firebase/messaging').default;
}
catch (_a) {
    // optional peer dependency
}
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let Linking = null;
try {
    Linking = require('react-native').Linking;
}
catch (_b) {
    // peer dependency
}
class NotificationRouter {
    constructor() {
        this.config = {};
        this.tokenManager = new TokenManager_1.TokenManager();
        this.coldStartHandler = new ColdStartHandler_1.ColdStartHandler();
        this.deepLinkListeners = [];
        this.tokenListeners = [];
        this.linkingSubscription = null;
        this.messagingUnsubscribe = null;
        this.initialized = false;
    }
    static getInstance() {
        if (!NotificationRouter._instance) {
            NotificationRouter._instance = new NotificationRouter();
        }
        return NotificationRouter._instance;
    }
    async configure(config) {
        var _a;
        this.config = config;
        if (config.android) {
            await AndroidChannelHelper_1.AndroidChannelHelper.createChannel(config.android.channelId, config.android.channelName, config.android.importance);
        }
        if (((_a = config.ios) === null || _a === void 0 ? void 0 : _a.requestPermissions) !== false && messaging) {
            try {
                await messaging().requestPermission();
            }
            catch (_b) {
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
    async getToken() {
        return this.tokenManager.getToken();
    }
    onTokenChange(handler) {
        this.tokenListeners.push(handler);
        return () => {
            this.tokenListeners = this.tokenListeners.filter((l) => l !== handler);
        };
    }
    onDeepLink(handler) {
        this.deepLinkListeners.push(handler);
        return () => {
            this.deepLinkListeners = this.deepLinkListeners.filter((l) => l !== handler);
        };
    }
    async getColdStartDeepLink() {
        return this.coldStartHandler.getInitialDeepLink();
    }
    handleBackgroundMessage() {
        if (!messaging)
            return;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        messaging().setBackgroundMessageHandler(async (_remoteMessage) => {
            // Background messages are handled by the OS notification tray.
            // Deep links from taps are captured via getInitialNotification on next foreground.
        });
    }
    isReady() {
        return this.initialized;
    }
    destroy() {
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
    setupLinkingListener() {
        if (!Linking)
            return;
        const subscription = Linking.addEventListener('url', ({ url }) => {
            this.emitDeepLink(url, 'linking');
        });
        this.linkingSubscription = () => { var _a; return (_a = subscription === null || subscription === void 0 ? void 0 : subscription.remove) === null || _a === void 0 ? void 0 : _a.call(subscription); };
    }
    setupForegroundNotificationListener() {
        if (!messaging)
            return;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        this.messagingUnsubscribe = messaging().onMessage(async (remoteMessage) => {
            var _a, _b, _c, _d, _e, _f, _g;
            const deepLink = (_f = (_d = (_b = (_a = remoteMessage === null || remoteMessage === void 0 ? void 0 : remoteMessage.data) === null || _a === void 0 ? void 0 : _a.deepLink) !== null && _b !== void 0 ? _b : (_c = remoteMessage === null || remoteMessage === void 0 ? void 0 : remoteMessage.data) === null || _c === void 0 ? void 0 : _c.deep_link) !== null && _d !== void 0 ? _d : (_e = remoteMessage === null || remoteMessage === void 0 ? void 0 : remoteMessage.data) === null || _e === void 0 ? void 0 : _e.url) !== null && _f !== void 0 ? _f : (_g = remoteMessage === null || remoteMessage === void 0 ? void 0 : remoteMessage.data) === null || _g === void 0 ? void 0 : _g.link;
            if (deepLink) {
                this.emitDeepLink(deepLink, 'notification');
            }
        });
    }
    emitDeepLink(url, source) {
        var _a, _b;
        this.deepLinkListeners.forEach((l) => l(url, source));
        (_b = (_a = this.config).onDeepLink) === null || _b === void 0 ? void 0 : _b.call(_a, url, source);
    }
}
exports.NotificationRouter = NotificationRouter;
NotificationRouter._instance = null;
//# sourceMappingURL=NotificationRouter.js.map