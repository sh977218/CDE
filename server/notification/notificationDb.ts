import { ClientErrorModel, LogErrorModel } from 'server/log/dbLogger';

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
