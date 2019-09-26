import { uriView } from 'shared/item';
import { capString } from 'shared/system/util';
import { usersToNotify } from 'shared/user';
import { handleError } from '../errorHandler/errorHandler';
import { CbError } from 'shared/models.model';
import {
    pushRegistrationSubscribersByType, pushRegistrationSubscribersByUsers, triggerPushMsg, typeToCriteria
} from 'server/notification/notificationSvc';

const async = require('async');
const _ = require('lodash');
const discussDb = require('../discuss/discussDb');
const userDb = require('../user/userDb');
const mongooseHelper = require('./mongooseHelper');

export function attachmentApproved(collection, id, cb) {
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

export function attachmentRemove(collection, id, cb) {
    collection.updateMany({'attachments.fileid': id}, {$pull: {attachments: {fileid: id}}}, cb);
}

const allowedRegStatuses = ['Retired', 'Incomplete', 'Candidate'];

export function badWorkingGroupStatus(elt, org) {
    return org && org.workingGroupOf && org.workingGroupOf.length > 0 && allowedRegStatuses.indexOf(elt.registrationState.registrationStatus) === -1;
}

export function fileUsed(collection, id, cb: CbError<boolean>) {
    mongooseHelper.exists(collection, {'attachments.fileid': id}, cb);
}

export function createTask(user, role, type, eltModule, eltTinyId, item) {
    let name;
    switch (type) {
        case 'approval':
            name = capString(type) + ' Request: ' + user.username + ' added ' + item + ' on '
                + capString(eltModule) + ' ' + eltTinyId + ' and needs approval';
    }
    const pushTask: any = {
        title: name,
        options: {
            body: 'Tasks can be completed using the notification bell menu on the navigation bar',
            icon: '/cde/public/assets/img/min/NIH-CDE-FHIR.png',
            badge: '/cde/public/assets/img/min/nih-cde-logo-simple.png',
            tag: 'cde-' + role + '-' + type,
            actions: [
                {
                    action: 'profile-action',
                    title: 'Edit Subscription',
                    icon: '/cde/public/assets/img/min/portrait.png'
                }
            ]
        }
    };
    if (!!eltTinyId) {
        pushTask.options.data = {url: uriView(eltModule, eltTinyId)};
        pushTask.options.actions.unshift({
            action: 'open-url',
            title: 'Open',
            icon: '/cde/public/assets/img/open_in_browser.png'
        });
    } else {
        pushTask.options.actions.unshift({
            action: 'open-app-action',
            title: 'View in Notification Bell',
            icon: '/cde/public/assets/img/min/nih-cde-logo-simple.png'
        });
    }
    const pushTaskMsg = JSON.stringify(pushTask);
    pushRegistrationSubscribersByType(type + role, handleError({}, registrations => {
        registrations.forEach(r => triggerPushMsg(r, pushTaskMsg));
    }), undefined);
}

export function bulkAction(ids, action, cb) {
    let eltsTotal = ids.length;
    let eltsProcessed = 0;
    async.each(ids, function (id, doneOne) {
            action(id, function () {
                eltsProcessed++;
                doneOne(null, eltsProcessed);
            });
        },
        function () {
            if (eltsTotal === eltsProcessed) cb(null);
            else cb('Task not performed completely!');
        }
    );
}

export function hideProprietaryIds(elt) {
    if (elt && elt.ids) {
        let blackList = [
            'LOINC'
        ];
        elt.ids.forEach(id => {
            if (blackList.indexOf(id.source) > -1) {
                id.id = 'Login to see value.';
                id.source = '(' + id.source + ')';
            }
        });
    }
}

export function notifyForComment(handlerOptions, commentOrReply, eltModule, eltTinyId, eltStewardOrg, users = [], cb = _.noop) {
    discussDb.byEltId(eltTinyId, handleError(handlerOptions, comments => {
        let userList = Array.from(new Set(comments
            .reduce((acc, c) => acc.concat(c.user._id, c.replies.map(r => r.user._id)), users)
            .filter(u => !!u && !u.equals(commentOrReply.user._id))
        ));
        userDb.find(typeToCriteria('comment', {
            users: userList,
            org: eltStewardOrg
        }), handleError(handlerOptions, users => {
            users = users.filter(u => !u.equals(commentOrReply.user._id));

            // drawer
            let userCommentNotification = {
                date: new Date(),
                eltModule,
                eltTinyId,
                read: false,
                text: commentOrReply.text,
                username: commentOrReply.user.username,
            };
            usersToNotify('comment', 'drawer', users).forEach((user: any) => {
                if (!user.commentNotifications) {
                    user.commentNotifications = [];
                }
                user.commentNotifications.push(userCommentNotification);
                if (user.commentNotifications.length > 100) {
                    user.commentNotifications.length = 100;
                }
                userDb.updateUser(user, {commentNotifications: user.commentNotifications}, _.noop);
            });

            // push
            let pushTaskMsg = JSON.stringify({
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
                registrations.forEach(r => triggerPushMsg(r, pushTaskMsg));
                cb();
            }));
        }));
    }));
}
