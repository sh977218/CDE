import {
    NotificationSettings,
    NotificationSettingsMedia, NotificationSettingsMediaType, NotificationSettingsType, User
} from 'shared/models.model';

declare function newNotificationSettings(): NotificationSettings;
declare function newNotificationSettingsMedia(): NotificationSettingsMedia;
declare function newNotificationSettingsMediaDrawer(): NotificationSettingsMedia;
declare function ownKeys(obj?: Object): string[];
declare function usersToNotify(type: NotificationSettingsType, media: NotificationSettingsMediaType, users: User[]): User[];
