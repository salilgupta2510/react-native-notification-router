"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AndroidChannelHelper = exports.IMPORTANCE = void 0;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let notifee = null;
try {
    notifee = require('@notifee/react-native').default;
}
catch (_a) {
    // optional peer dependency
}
exports.IMPORTANCE = {
    NONE: 0,
    MIN: 1,
    LOW: 2,
    DEFAULT: 3,
    HIGH: 4,
};
class AndroidChannelHelper {
    static async createChannel(channelId, name, importance = exports.IMPORTANCE.DEFAULT) {
        if (!notifee) {
            console.warn('[react-native-notification-router] @notifee/react-native not installed. Android channels skipped.');
            return channelId;
        }
        return notifee.createChannel({ id: channelId, name, importance });
    }
    static async createDefaultChannel(name) {
        return AndroidChannelHelper.createChannel(`${name.toLowerCase().replace(/\s+/g, '_')}_default`, name, exports.IMPORTANCE.DEFAULT);
    }
    static async createSilentChannel(name) {
        return AndroidChannelHelper.createChannel(`${name.toLowerCase().replace(/\s+/g, '_')}_silent`, name, exports.IMPORTANCE.LOW);
    }
    static async createUrgentChannel(name) {
        return AndroidChannelHelper.createChannel(`${name.toLowerCase().replace(/\s+/g, '_')}_urgent`, name, exports.IMPORTANCE.HIGH);
    }
}
exports.AndroidChannelHelper = AndroidChannelHelper;
//# sourceMappingURL=AndroidChannelHelper.js.map