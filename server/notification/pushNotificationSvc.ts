// cb(err, registrations)
import { find } from 'server/user/userDb';
import { pushRegistrationFindActive } from 'server/notification/notificationDb';
import { ClientErrorModel, LogErrorModel } from 'server/log/dbLogger';
import { criteriaSet, typeToCriteria, typeToNotificationSetting } from 'server/notification/notificationSvc';

export function pushRegistrationSubscribersByType(type, cb, data) {
    find(
        criteriaSet(
            typeToCriteria(type, data),
            'notificationSettings.' + typeToNotificationSetting(type) + '.push'
        ),
        (err, users) => {
            if (err) {
                return cb(err);
            }
            pushRegistrationSubscribersByUsers(users, cb);
        }
    );
}

// cb(err, registrations)
export function pushRegistrationSubscribersByUsers(users, cb) {
    const userIds = users.map(u => u._id.toString());
    pushRegistrationFindActive({userId: {$in: userIds}}, cb);
}


export function getNumberServerError(user) {
    const query = LogErrorModel.countDocuments(
        user.notificationDate.serverLogDate
            ? {date: {$gt: user.notificationDate.serverLogDate}}
            : {}
    );
    return query.exec();
}

export function getNumberClientError(user) {
    const query = ClientErrorModel.countDocuments(
        user.notificationDate.clientLogDate
            ? {date: {$gt: user.notificationDate.clientLogDate}}
            : {}
    );
    return query.exec();
}