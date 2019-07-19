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

export function ownKeys(obj?: Object): string[] {
    return obj ? Object.keys(obj).filter(k => obj.hasOwnProperty(k)) : [];
}

export function usersToNotify(type: NotificationSettingsType, media: NotificationSettingsMediaType, users: User[]): User[] {
    return users.filter(u =>
        u.notificationSettings && u.notificationSettings[type] && u.notificationSettings[type]![media] === true
        || (!u.notificationSettings || !u.notificationSettings[type] || u.notificationSettings[type]![media] !== false) && media === 'drawer' // drawer default true, mongoose defaults missing objects
    );
}
