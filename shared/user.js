import { capString } from 'shared/system/util';

export function newNotificationSettings() {
    return {approvalComment: newNotificationSettingsMedia(), comment: newNotificationSettingsMedia()};
}

export function newNotificationSettingsMedia() {
    return {drawer: undefined, push: undefined};
}

export function usersToNotify(type, media, users) {
    return users.filter(u => u.notificationSettings && u.notificationSettings[type]
        && u.notificationSettings[type][media] === true);
}
