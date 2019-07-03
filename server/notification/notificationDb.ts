import { ClientErrorModel, LogErrorModel } from '../log/dbLogger';

export function getNumberServerError(user) {
    let query = LogErrorModel.countDocuments(
        user.notificationDate.serverLogDate
            ? {date: {$gt: user.notificationDate.serverLogDate}}
            : {}
    );
    return query.exec();
}

export function getNumberClientError(user) {
    let query = ClientErrorModel.countDocuments(
        user.notificationDate.clientLogDate
            ? {date: {$gt: user.notificationDate.clientLogDate}}
            : {}
    );
    return query.exec();
}
