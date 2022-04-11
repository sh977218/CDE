import {
    NotificationSettings,
    NotificationSettingsMedia, NotificationSettingsMediaType, NotificationSettingsType, User
} from 'shared/models.model';

export function newNotificationSettings(): NotificationSettings {
    return {comment: newNotificationSettingsMediaDrawer()};
}

export function newNotificationSettingsMedia(): NotificationSettingsMedia {
    return {drawer: undefined, push: undefined};
}

export function newNotificationSettingsMediaDrawer(): NotificationSettingsMedia {
    return {drawer: true, push: undefined};
}

export function usersToNotify<T extends User>(type: NotificationSettingsType, medium: NotificationSettingsMediaType, users: T[]): T[] {
    return users.filter(u => {
        const media = u.notificationSettings && u.notificationSettings[type];
        return media && media[medium]
            || medium === 'drawer' && !(media && media[medium] === false); // drawer default true, mongoose defaults missing objects
    });
}
