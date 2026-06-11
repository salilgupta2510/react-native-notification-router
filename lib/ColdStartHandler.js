"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ColdStartHandler = void 0;
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
class ColdStartHandler {
    async getInitialDeepLink() {
        const [notifLink, linkingUrl] = await Promise.all([
            this.getNotificationDeepLink(),
            this.getLinkingInitialUrl(),
        ]);
        return notifLink !== null && notifLink !== void 0 ? notifLink : linkingUrl;
    }
    async getInitialNotification() {
        if (!messaging)
            return null;
        try {
            const remoteMessage = await messaging().getInitialNotification();
            if (!remoteMessage)
                return null;
            return this.normalizeRemoteMessage(remoteMessage);
        }
        catch (_a) {
            return null;
        }
    }
    extractDeepLink(notification) {
        var _a, _b, _c, _d, _e;
        if (notification.deepLink)
            return notification.deepLink;
        const data = (_a = notification.data) !== null && _a !== void 0 ? _a : {};
        return (_e = (_d = (_c = (_b = data['deepLink']) !== null && _b !== void 0 ? _b : data['deep_link']) !== null && _c !== void 0 ? _c : data['url']) !== null && _d !== void 0 ? _d : data['link']) !== null && _e !== void 0 ? _e : null;
    }
    async getNotificationDeepLink() {
        const notification = await this.getInitialNotification();
        if (!notification)
            return null;
        return this.extractDeepLink(notification);
    }
    async getLinkingInitialUrl() {
        if (!Linking)
            return null;
        try {
            return await Linking.getInitialURL();
        }
        catch (_a) {
            return null;
        }
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    normalizeRemoteMessage(msg) {
        var _a, _b, _c, _d, _e, _f, _g, _h, _j;
        return {
            id: msg.messageId,
            title: (_a = msg.notification) === null || _a === void 0 ? void 0 : _a.title,
            body: (_b = msg.notification) === null || _b === void 0 ? void 0 : _b.body,
            data: msg.data,
            deepLink: (_h = (_f = (_d = (_c = msg.data) === null || _c === void 0 ? void 0 : _c.deepLink) !== null && _d !== void 0 ? _d : (_e = msg.data) === null || _e === void 0 ? void 0 : _e.deep_link) !== null && _f !== void 0 ? _f : (_g = msg.data) === null || _g === void 0 ? void 0 : _g.url) !== null && _h !== void 0 ? _h : (_j = msg.data) === null || _j === void 0 ? void 0 : _j.link,
        };
    }
}
exports.ColdStartHandler = ColdStartHandler;
//# sourceMappingURL=ColdStartHandler.js.map