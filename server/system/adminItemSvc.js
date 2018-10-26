const mongo_data = require('./mongo-data');
const async = require('async');
const auth = require('./authorization');
const fs = require('fs');
const md5 = require('md5-file');
const clamav = require('clamav.js');
const config = require('./parseConfig');
const logging = require('./logging');
const pushNotification = require('../system/pushNotification');
const handleError = require('../log/dbLogger').handleError;
const streamifier = require('streamifier');
const utilShared = require('@std/esm')(module)("../../shared/system/util");

exports.setAttachmentDefault = function (req, res, dao) {
    auth.checkOwnership(dao, req.body.id, req, function (err, elt) {
        if (err) {
            logging.expressLogger.info(err);
            return res.status(500).send('ERROR - attachment as default - cannot check ownership');
        }
        var state = req.body.state;
        for (var i = 0; i < elt.attachments.length; i++) {
            elt.attachments[i].isDefault = false;
        }
        elt.attachments[req.body.index].isDefault = state;
        elt.save(function (err) {
            if (err) {
                res.send('error: ' + err);
            } else {
                res.send(elt);
            }
        });
    });
};

exports.scanFile = (stream, res, cb) => {
    clamav.createScanner(config.antivirus.port, config.antivirus.ip).scan(stream, (err, object, malicious) => {
        if (err) return cb(false);
        if (malicious) return res.status(431).send('The file probably contains a virus.');
        cb(true);
    });
};

exports.addAttachment = function (req, res, dao) {
    if (!req.files.uploadedFiles) {
        res.status(400).send('No files to attach.');
        return;
    }

    var fileBuffer = req.files.uploadedFiles.buffer;
    var stream = streamifier.createReadStream(fileBuffer);
    var streamFS = streamifier.createReadStream(fileBuffer);
    var streamFS1 = streamifier.createReadStream(fileBuffer);
    exports.scanFile(stream, res, function (scanned) {
        req.files.uploadedFiles.scanned = scanned;
        auth.checkOwnership(dao, req.body.id, req, handleError({req, res}, elt => {
            dao.userTotalSpace(req.user.username, function (totalSpace) {
                if (totalSpace > req.user.quota) {
                    return res.send({message: 'You have exceeded your quota'});
                }
                var file = req.files.uploadedFiles;
                file.stream = streamFS1;

                //store it to FS here
                var writeStream = fs.createWriteStream(file.path);
                streamFS.pipe(writeStream);
                writeStream.on('finish', function () {
                    md5(file.path, function (err, hash) {
                        file.md5 = hash;
                        mongo_data.addAttachment(file, req.user, 'some comment', elt, (attachment, requiresApproval) => {
                            if (requiresApproval) {
                                exports.createApprovalMessage(req.user, 'AttachmentReviewer', 'AttachmentApproval', attachment);
                            }
                            res.send(elt);
                        });
                    });
                });
            });
        }));
    });
};

exports.removeAttachment = function (req, res, dao) {
    auth.checkOwnership(dao, req.body.id, req, function (err, elt) {
        if (err) return res.status(500).send('ERROR - remove attachment ownership');
        let fileid = elt.attachments[req.body.index].fileid;
        elt.attachments.splice(req.body.index, 1);

        elt.save(function (err) {
            if (err) return res.status(500).send('ERROR - cannot save attachment');
            res.send(elt);
            mongo_data.removeAttachmentIfNotUsed(fileid);
        });
    });
};

exports.removeAttachmentLinks = function (id, collection) {
    collection.update({'attachments.fileid': id}, {$pull: {'attachments': {'fileid': id}}});
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

    let msg = JSON.stringify({
        title: utilShared.capString(type) + ' Request',
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
    mongo_data.pushGetRegistrations(type + role, registrations => {
        registrations.forEach(r => pushNotification.triggerPushMsg(r, msg));
    });
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