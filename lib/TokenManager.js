"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TokenManager = void 0;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let messaging = null;
try {
    messaging = require('@react-native-firebase/messaging').default;
}
catch (_a) {
    // optional peer dependency not installed
}
class TokenManager {
    constructor() {
        this.listeners = [];
        this.unsubscribeRefresh = null;
    }
    async getToken() {
        var _a;
        const token = {};
        if (!messaging)
            return token;
        try {
            token.fcm = await messaging().getToken();
        }
        catch (e) {
            // token unavailable
        }
        try {
            token.apns = (_a = await messaging().getAPNSToken()) !== null && _a !== void 0 ? _a : undefined;
        }
        catch (_b) {
            // APNs only available on iOS
        }
        return token;
    }
    async refreshToken() {
        if (!messaging)
            return {};
        try {
            await messaging().deleteToken();
        }
        catch (_a) {
            // ignore
        }
        return this.getToken();
    }
    onTokenRefresh(handler) {
        this.listeners.push(handler);
        if (!this.unsubscribeRefresh && messaging) {
            this.unsubscribeRefresh = messaging().onTokenRefresh(async () => {
                const token = await this.getToken();
                this.listeners.forEach((l) => l(token));
            });
        }
        return () => {
            this.listeners = this.listeners.filter((l) => l !== handler);
        };
    }
    async deleteToken() {
        if (!messaging)
            return;
        try {
            await messaging().deleteToken();
        }
        catch (_a) {
            // ignore
        }
    }
    isTokenValid(token) {
        return typeof token === 'string' && token.length > 10;
    }
    destroy() {
        this.listeners = [];
        if (this.unsubscribeRefresh) {
            this.unsubscribeRefresh();
            this.unsubscribeRefresh = null;
        }
    }
}
exports.TokenManager = TokenManager;
//# sourceMappingURL=TokenManager.js.map