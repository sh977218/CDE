import { getClientErrorsNumber, getServerErrorsNumber } from 'server/log/dbLogger';
import { CommentNotification, UserDocument } from 'server/user/userDb';
import { version } from 'server/version';
import { uriView } from 'shared/item';
import { Task } from 'shared/models.model';
import { isSiteAdmin } from 'shared/security/authorizationShared';
import { capitalize } from 'shared/util';

function createTaskFromCommentNotification(c: CommentNotification): Task {
    return {
        date: c.date,
        id: c.eltTinyId,
        idType: c.eltModule,
        name: c.username + ' commented',
        properties: [{
            key: capitalize(c.eltModule),
            value: c.eltTinyId,
        }],
        source: 'user',
        state: !c.read && 1 || 0,
        text: c.text,
        type: 'comment',
        url: uriView(c.eltModule, c.eltTinyId),
    };
}

export async function taskAggregator(user: UserDocument, clientVersion: string): Promise<Task[]> {
    const tasks: Task[] = (user ? user.commentNotifications.map(createTaskFromCommentNotification) : [])
        .filter(t => t.type !== 'approve');

    let clientErrorPromise;
    let serverErrorPromise;

    if (isSiteAdmin(user)) {
        clientErrorPromise = getClientErrorsNumber(user).then(clientErrorCount => {
            if (clientErrorCount > 0) {
                tasks.push({
                    date: new Date(),
                    id: clientErrorCount + '',
                    idType: 'clientError',
                    name: clientErrorCount + ' New Client Errors',
                    properties: [],
                    source: 'calculated',
                    type: 'message',
                    url: '/siteAudit?tab=clientErrors',
                });
            }
        });
        serverErrorPromise = getServerErrorsNumber(user).then(serverErrorCount => {
            if (serverErrorCount > 0) {
                tasks.push({
                    date: new Date(),
                    id: serverErrorCount + '',
                    idType: 'serverError',
                    name: serverErrorCount + ' New Server Errors',
                    properties: [],
                    source: 'calculated',
                    type: 'message',
                    url: '/siteAudit?tab=serverErrors',
                });
            }
        });
    }

    if (clientVersion && version !== clientVersion) {
        tasks.push({
            date: new Date(),
            id: version,
            idType: 'versionUpdate',
            name: 'Website Updated',
            properties: [],
            source: 'calculated',
            text: 'A new version of this site is available. To enjoy the new features, please close all CDE tabs then load again.',
            type: 'error',
        });
    }

    await clientErrorPromise;
    await serverErrorPromise;
    return tasks;
}
