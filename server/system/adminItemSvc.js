const async = require('async');
const _ = require('lodash');
const itemShared = require('@std/esm')(module)('../../shared/item');
const utilShared = require('@std/esm')(module)('../../shared/system/util');
const userShared = require('@std/esm')(module)('../../shared/user');
const discussDb = require('../discuss/discussDb');
const dbLogger = require('../log/dbLogger');
const notificationSvc = require('../notification/notificationSvc');
const userDb = require('../user/userDb');
const handleError = dbLogger.handleError;
const mongo_data = require('./mongo-data');
const pushNotification = require('./pushNotification');
// const deValidator = require('@std/esm')(module)('../../shared/de/deValidator');

// exports.save = function (req, res, dao, cb) {
//     var elt = req.body;
//     deValidator.wipeDatatype(elt);
//     if (!req.isAuthenticated()) {
//         return res.status(403).send('You are not authorized to do this.');
//     }
//     if (!elt._id) {
//         if (!elt.stewardOrg.name) {
//             res.send('Missing Steward');
//         } else {
//             if (req.user.orgCurator.indexOf(elt.stewardOrg.name) < 0 &&
//                 req.user.orgAdmin.indexOf(elt.stewardOrg.name) < 0 && !req.user.siteAdmin) {
//                 res.status(403).send('not authorized');
//             } else if (elt.registrationState && elt.registrationState.registrationStatus) {
//                 if ((elt.registrationState.registrationStatus === 'Standard' ||
//                     elt.registrationState.registrationStatus === ' Preferred Standard') && !req.user.siteAdmin) { // TODO: what is the space doing there? (many occurrences)
//                     return res.status(403).send('Not authorized');
//                 }
//                 return dao.create(elt, req.user, function (err, savedItem) {
//                     res.send(savedItem);
//                 });
//             } else {
//                 return dao.create(elt, req.user, function (err, savedItem) {
//                     res.send(savedItem);
//                 });
//             }
//         }
//     } else {
//         return dao.byId(elt._id, function (err, item) {
//             if (item.archived === true) {
//                 return res.send('Element is archived.');
//             }
//             if (req.user.orgCurator.indexOf(item.stewardOrg.name) < 0 &&
//                 req.user.orgAdmin.indexOf(item.stewardOrg.name) < 0 && !req.user.siteAdmin) {
//                 res.status(403).send('Not authorized');
//             } else {
//                 if ((item.registrationState.registrationStatus === 'Standard' ||
//                     item.registrationState.registrationStatus === 'Preferred Standard') && !req.user.siteAdmin) {
//                     res.status(403).send('This record is already standard.');
//                 } else {
//                     if ((item.registrationState.registrationStatus !== 'Standard' && item.registrationState.registrationStatus !== ' Preferred Standard') &&
//                         (item.registrationState.registrationStatus === 'Standard' ||
//                             item.registrationState.registrationStatus === 'Preferred Standard') && !req.user.siteAdmin
//                     ) {
//                         res.status(403).send('Not authorized');
//                     } else {
//                         mongo_data.orgByName(item.stewardOrg.name, function (err, org) {
//                             var allowedRegStatuses = ['Retired', 'Incomplete', 'Candidate'];
//                             if (org && org.workingGroupOf && org.workingGroupOf.length > 0 && allowedRegStatuses.indexOf(elt.registrationState.registrationStatus) === -1) {
//                                 res.status(403).send('Not authorized');
//                             } else {
//                                 return dao.update(elt, req.user, function (err, response) {
//                                     if (err) res.status(400).send();
//                                     res.send(response);
//                                     if (cb) cb();
//                                 });
//                             }
//                         });
//                     }
//                 }
//             }
//         });
//     }
// };

exports.attachmentApproved = (collection, id, cb) => {
    collection.update(
        {'attachments.fileid': id},
        {
            $unset: {
                'attachments.$.pendingApproval': ''
            }
        },
        {multi: true}, cb);
};

exports.attachmentRemove = (collection, id, cb) => {
    collection.update({'attachments.fileid': id}, {$pull: {'attachments': {'fileid': id}}}, cb);
};

exports.fileUsed = (collection, id, cb) => {
    collection.find({'attachments.fileid': id}).count({}, (err, count) => {
        cb(err, count > 0);
    });
};

exports.createApprovalMessage = function (user, role, type, details) {
    mongo_data.createMessage({
        author: {authorType: 'user', name: user.username},
        date: new Date(),
        recipient: {recipientType: 'role', name: role},
        states: [{
            action: String,
            date: new Date(),
            comment: String
        }],
        type: type,
        typeAttachmentApproval: type === 'AttachmentApproval' ? details : undefined,
    });
};

exports.createTask = function (user, role, type, details) {
    // mongo_data.taskCreate({
    //     from: [{type: 'user', typeId: user.username}],
    //     to: {type: 'role', typeId: role},
    //     type: type,
    //     typeInfo: details,
    // });

    let name = utilShared.capString(type) + ' Request';
    let pushTaskMsg = JSON.stringify({
        title: name,
        options: {
            body: 'Tasks can be completed using the notification bell menu on the navigation bar',
            icon: '/cde/public/assets/img/min/NIH-CDE-FHIR.png',
            badge: '/cde/public/assets/img/min/nih-cde-logo-simple.png',
            tag: 'cde-' + type,
            actions: [
                {
                    action: 'open-app-action',
                    title: 'View in Notification Bell',
                    icon: '/cde/public/assets/img/min/nih-cde-logo-simple.png'
                },
                {
                    action: 'profile-action',
                    title: 'Edit Subscription',
                    icon: '/cde/public/assets/img/min/portrait.png'
                }
            ]
        }
    });
    mongo_data.pushRegistrationSubscribersByType(type + role, handleError({}, registrations => {
        registrations.forEach(r => pushNotification.triggerPushMsg(r, pushTaskMsg));
    }));
};

exports.bulkAction = function (ids, action, cb) {
    var eltsTotal = ids.length;
    var eltsProcessed = 0;
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
};

exports.hideProprietaryIds = function (elt) {
    if (elt && elt.ids) {
        var blackList = [
            'LOINC'
        ];
        elt.ids.forEach(function (id) {
            if (blackList.indexOf(id.source) > -1) {
                id.id = 'Login to see value.';
                id.source = '(' + id.source + ')';
            }
        });
    }
};

exports.notifyForComment = (handlerOptions, eltModule, commentOrReply, elt, cb = _.noop) => {
    const eltTinyId = elt.tinyId;
    discussDb.byEltId(eltTinyId, handleError(handlerOptions, comments => {
        let userList = Array.from(new Set(comments
            .reduce((acc, c) => acc.concat(c.user._id, c.replies.map(r => r.user._id)), [])
            .filter(u => !!u && !u.equals(commentOrReply.user._id))
        ));
        userDb.find(notificationSvc.typeToCriteria('comment', {users: userList, org: elt.stewardOrg && elt.stewardOrg.name}), handleError(handlerOptions, users => {
            users = users.filter(u => !u.equals(commentOrReply.user._id));

            // drawer
            let userTaskMsg = {
                id: commentOrReply._id,
                idType: !!commentOrReply.element ? 'comment' : 'commentReply',
                name: commentOrReply.user.username + ' commented',
                properties: [
                    {
                        key: utilShared.capString(eltModule),
                        link: itemShared.uriViewBase(eltModule),
                        linkParams: itemShared.uriViewBase(eltModule) && {tinyId: eltTinyId},
                        value: eltTinyId,
                    }
                ],
                source: 'user',
                text: commentOrReply.text,
                type: 'message',
            };
            userShared.usersToNotify('comment', 'drawer', users).forEach(user => {
                if (!user.tasks) {
                    user.tasks = [];
                }
                user.tasks.push(userTaskMsg);
                if (user.tasks.length > 100) {
                    user.tasks.length = 100;
                }
                userDb.updateUser(user, {tasks: user.tasks}, _.noop);
            });

            // push
            let pushTaskMsg = JSON.stringify({
                title: commentOrReply.user.username + ' commented on ' + utilShared.capString(eltModule) + ' ' + eltTinyId,
                options: {
                    body: commentOrReply.text,
                    data: {uri: itemShared.uriView(eltModule, eltTinyId)},
                    icon: '/cde/public/assets/img/min/NIH-CDE-FHIR.png',
                    badge: '/cde/public/assets/img/min/nih-cde-logo-simple.png',
                    tag: 'cde-comment-' + eltModule + '-' + eltTinyId,
                    actions: [
                        {
                            action: 'open-uri',
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
            mongo_data.pushRegistrationSubscribersByUsers(userShared.usersToNotify('comment', 'push', users), handleError(handlerOptions, registrations => {
                registrations.forEach(r => pushNotification.triggerPushMsg(r, pushTaskMsg));
                cb();
            }));
        }));
    }));
};
