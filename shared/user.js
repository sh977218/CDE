import { capString } from 'shared/system/util';

export function newNotificationSettings() {
    return {comment: newNotificationSettingsMediaDrawer()};
}

export function newNotificationSettingsMedia() {
    return {drawer: undefined, push: undefined};
}

export function newNotificationSettingsMediaDrawer() {
    return {drawer: true, push: undefined};
}

export function usersToNotify(type, media, users) {
    return users.filter(u =>
        u.notificationSettings && u.notificationSettings[type] && u.notificationSettings[type][media] === true
        || (!u.notificationSettings || !u.notificationSettings[type] || u.notificationSettings[type][media] !== false) && media === 'drawer' // drawer default true, mongoose defaults missing objects
    );
}
