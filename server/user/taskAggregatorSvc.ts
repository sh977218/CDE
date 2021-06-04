import { unapproved as attachmentUnapproved } from 'server/attachment/attachmentSvc';
import { unapproved as discussUnapproved } from 'server/discuss/discussDb';
import { getClientErrorsNumber, getServerErrorsNumber } from 'server/log/dbLogger';
import { ItemDocument } from 'server/system/mongo-data';
import { CommentNotification, UserDocument } from 'server/user/userDb';
import { version } from 'server/version';
import { hasRole, isSiteAdmin } from 'shared/system/authorizationShared';
import { getModule } from 'shared/elt';
import { uriView } from 'shared/item';
import { Comment, CommentReply, ModuleAll, Task } from 'shared/models.model';
import { capString } from 'shared/system/util';
import { promisify } from 'util';

function createTaskFromCommentNotification(c: CommentNotification): Task {
    return {
        date: c.date,
        id: c.eltTinyId,
        idType: c.eltModule,
        name: c.username + ' commented',
        properties: [{
            key: capString(c.eltModule),
            value: c.eltTinyId,
        }],
        source: 'user',
        state: !c.read && 1 || 0,
        text: c.text,
        type: 'comment',
        url: uriView(c.eltModule, c.eltTinyId),
    };
}

function pending(comment: Comment) {
    let pending: CommentReply[] = [];
    if (comment.pendingApproval) {
        pending.push(comment);
    }
    if (Array.isArray(comment.replies)) {
        pending = pending.concat(comment.replies.filter(r => r.pendingApproval));
    }
    return pending;
}

export async function taskAggregator(user: UserDocument, clientVersion: string): Promise<Task[]> {
    const tasks: Task[] = user ? user.commentNotifications.map(createTaskFromCommentNotification) : [];

    let clientErrorPromise;
    let serverErrorPromise;
    let unapprovedAttachmentsPromise;
    let unapprovedCommentsPromise;

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

    if (hasRole(user, 'CommentReviewer')) { // required, req.user.notificationSettings.approvalComment.drawer not used
        unapprovedCommentsPromise = discussUnapproved().then(comments => {
            if (Array.isArray(comments)) {
                comments.forEach(c => {
                    const eltModule: ModuleAll = c.element.eltType;
                    const eltTinyId: string = c.element.eltId;
                    pending(c).forEach(p => {
                        const task: Task = {
                            date: new Date(),
                            id: p._id,
                            idType: p === c ? 'comment' : 'commentReply',
                            name: '',
                            properties: [
                                {
                                    key: capString(eltModule),
                                    value: eltTinyId,
                                }
                            ],
                            source: 'calculated',
                            text: p.text,
                            type: 'approve',
                            url: uriView(eltModule, eltTinyId),
                        };
                        const username = p.user && p.user.username || c.user && c.user.username;
                        if (username) {
                            task.properties.unshift({
                                key: 'User',
                                value: username
                            });
                        }
                        tasks.push(task);
                    });
                });
            }
        });
    }

    await clientErrorPromise;
    await serverErrorPromise;
    await unapprovedAttachmentsPromise;
    await unapprovedCommentsPromise;
    return tasks;
}
