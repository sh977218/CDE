import { noop } from 'lodash';
import { Document, Model } from 'mongoose';
import { ObjectId } from 'server';
import { byEltId as discussByEltId, CommentReply } from 'server/discuss/discussDb';
import { handleError, handleNotFound, HandlerOptions } from 'server/errorHandler/errorHandler';
import { typeToCriteria } from 'server/notification/notificationSvc';
import { pushRegistrationSubscribersByUsers, triggerPushMsg } from 'server/notification/pushNotificationSvc';
import { exists } from 'server/system/mongooseHelper';
import { find as userFind, updateUser } from 'server/user/userDb';
import { uriView } from 'shared/item';
import { Attachment, CbError, CbError1, Elt, Item, ModuleAll } from 'shared/models.model';
import { Organization } from 'shared/organization/organization';
import { usersToNotify } from 'shared/user';
import { capString } from 'shared/util';

export function attachmentApproved(collection: Model<Item & Document>, id: string, cb: CbError1<Attachment>) {
    collection.updateMany(
        {'attachments.fileid': id},
        {
            $unset: {
                'attachments.$.pendingApproval': ''
            }
        },
        cb
    );
}

export function attachmentRemove(collection: Model<Elt & Document>, id: string, cb: CbError) {
    collection.updateMany({'attachments.fileid': id}, {$pull: {attachments: {fileid: id}}}, cb);
}

const allowedRegStatuses = ['Retired', 'Incomplete', 'Candidate'];

export function badWorkingGroupStatus(elt: Item, org: Organization) {
    return org && org.workingGroupOf && org.workingGroupOf.length > 0
        && allowedRegStatuses.indexOf(elt.registrationState.registrationStatus) === -1;
}

// export function createTask(user: User, role: UserRoles, type: 'approval', eltModule: ModuleAll, eltTinyId: string,
//                            item: 'attachment' | 'comment') {
//     let name;
//     switch (type) {
//         case 'approval':
//             name = capString(type) + ' Request: ' + user.username + ' added ' + item + ' on '
//                 + capString(eltModule) + ' ' + eltTinyId + ' and needs approval';
//     }
//     const pushTask: any = {
//         title: name,
//         options: {
//             body: 'Tasks can be completed using the notification bell menu on the navigation bar',
//             icon: '/cde/public/assets/img/min/NIH-CDE-FHIR.png',
//             badge: '/cde/public/assets/img/min/nih-cde-logo-simple.png',
//             tag: 'cde-' + role + '-' + type,
//             actions: [
//                 {
//                     action: 'profile-action',
//                     title: 'Edit Subscription',
//                     icon: '/cde/public/assets/img/min/portrait.png'
//                 }
//             ]
//         }
//     };
//     if (!!eltTinyId) {
//         pushTask.options.data = {url: uriView(eltModule, eltTinyId)};
//         pushTask.options.actions.unshift({
//             action: 'open-url',
//             title: 'Open',
//             icon: '/cde/public/assets/img/open_in_browser.png'
//         });
//     } else {
//         pushTask.options.actions.unshift({
//             action: 'open-app-action',
//             title: 'View in Notification Bell',
//             icon: '/cde/public/assets/img/min/nih-cde-logo-simple.png'
//         });
//     }
//     const pushTaskMsg = JSON.stringify(pushTask);
//     pushRegistrationSubscribersByType(type + role as any, handleError({}, registrations => {
//         if (registrations) {
//             registrations.forEach(r => triggerPushMsg(r, pushTaskMsg));
//         }
//     }), undefined);
// }

export function fileUsed(collection: Model<any>, id: string, cb: CbError1<boolean>) {
    exists(collection, {'attachments.fileid': id}, cb);
}

export function hideProprietaryIds(elt: Item) {
    if (elt && elt.ids) {
        const blackList = [
            'LOINC'
        ];
        elt.ids.forEach(id => {
            if (blackList.indexOf(id.source || '') > -1) {
                id.id = 'Login to see value.';
                id.source = '(' + id.source + ')';
            }
        });
    }
}

export function notifyForComment(handlerOptions: HandlerOptions, commentOrReply: CommentReply, eltModule: ModuleAll,
                                 eltTinyId: string, eltStewardOrg?: string, users: ObjectId[] = [], cb = noop) {
    discussByEltId(eltTinyId, handleNotFound(handlerOptions, comments => {
        const userList: ObjectId[] = Array.from(new Set(comments
            .reduce<ObjectId[]>((acc, c) => acc.concat(c.user._id, c.replies.map(r => r.user._id)), users)
            .filter(u => !!u && !u.equals(commentOrReply.user._id))
        ));
        userFind(typeToCriteria('comment', {
            users: userList,
            org: eltStewardOrg
        }), handleNotFound(handlerOptions, users => {
            users = users.filter(u => !u._id.equals(commentOrReply.user._id));

            // drawer
            const userCommentNotification = {
                date: new Date(),
                eltModule,
                eltTinyId,
                read: false,
                text: commentOrReply.text,
                username: commentOrReply.user.username,
            };
            usersToNotify('comment', 'drawer', users).forEach((user) => {
                if (!user.commentNotifications) {
                    user.commentNotifications = [];
                }
                user.commentNotifications.push(userCommentNotification);
                if (user.commentNotifications.length > 100) {
                    user.commentNotifications.length = 100;
                }
                updateUser(user, {commentNotifications: user.commentNotifications}, noop);
            });

            // push
            const pushTaskMsg = JSON.stringify({
                title: commentOrReply.user.username + ' commented on ' + capString(eltModule) + ' ' + eltTinyId,
                options: {
                    body: commentOrReply.text,
                    data: {url: uriView(eltModule, eltTinyId)},
                    icon: '/cde/public/assets/img/min/NIH-CDE-FHIR.png',
                    badge: '/cde/public/assets/img/min/nih-cde-logo-simple.png',
                    tag: 'cde-comment-' + eltModule + '-' + eltTinyId,
                    actions: [
                        {
                            action: 'open-url',
                            title: 'Open',
                            icon: '/cde/public/assets/img/open_in_browser.png'
                        },
                        {
                            action: 'profile-action',
                            title: 'Edit Subscription',
                            icon: '/cde/public/assets/img/min/portrait.png'
                        }
                    ]
                }
            });
            pushRegistrationSubscribersByUsers(usersToNotify('comment', 'push', users), handleError(handlerOptions, registrations => {
                if (registrations) {
                    registrations.forEach(r => triggerPushMsg(r, pushTaskMsg));
                }
                cb();
            }));
        }));
    }));
}
