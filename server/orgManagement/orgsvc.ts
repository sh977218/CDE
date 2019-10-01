import { orgAdmins as userOrgAdmins, orgCurators as userOrgCurators, userById, userByName } from 'server/user/userDb';
import { managedOrgs, orgByName } from 'server/orgManagement/orgDb';
import { handle40x, handleError } from 'server/errorHandler/errorHandler';
import { hasRole, isOrgAdmin } from 'shared/system/authorizationShared';
import { getDaoList } from 'server/system/moduleDaoManager';

const async = require('async');

export function myOrgsAdmins(req, res) {
    userById(req.user._id, handle40x({req, res}, foundUser => {
        userOrgAdmins(handle40x({req, res}, users => {
            res.send(foundUser.orgAdmin
                .map(org => ({
                    name: org,
                    users: users
                        .filter(u => u.orgAdmin.indexOf(org) > -1)
                        .map(u => ({
                            _id: u._id,
                            username: u.username,
                        })),
                }))
                .filter(r => r.users.length > 0));
        }));
    }));
}

export function orgCurators(req, res) {
    userOrgCurators(req.user.orgAdmin, handle40x({req, res}, users => {
        res.send(req.user.orgAdmin
            .map(org => ({
                name: org,
                users: users
                    .filter(user => user.orgCurator.indexOf(org) > -1)
                    .map(user => ({
                        _id: user._id,
                        username: user.username,
                    })),
            }))
            .filter(org => org.users.length > 0)
        );
    }));
}

export function orgAdmins(req, res) {
    managedOrgs(handle40x({req, res}, managedOrgs => {
        userOrgAdmins(handle40x({req, res}, users => {
            res.send(managedOrgs
                .map(mo => ({
                    name: mo.name,
                    users: users
                        .filter(u => u.orgAdmin.indexOf(mo.name) > -1)
                        .map(u => ({
                            _id: u._id,
                            username: u.username,
                        })),
                }))
            );
        }));
    }));
}

export function addOrgAdmin(req, res) {
    userByName(req.body.username, handle40x({req, res}, user => {
        let changed = false;
        if (user.orgAdmin.indexOf(req.body.org) === -1) {
            user.orgAdmin.push(req.body.org);
            changed = true;
        }
        if (!hasRole(user, 'CommentReviewer')) {
            user.roles.push('CommentReviewer');
            changed = true;
        }

        if (!changed) {
            return res.send();
        }
        user.save(handleError({req, res}, () => {
            res.send();
        }));
    }));
}

export function removeOrgAdmin(req, res) {
    userById(req.body.userId, handle40x({req, res}, found => {
        const orgInd = found.orgAdmin.indexOf(req.body.org);
        if (orgInd < 0) {
            return res.send();
        }
        found.orgAdmin.splice(orgInd, 1);
        found.save(handleError({req, res}, () => {
            res.send();
        }));
    }));
}

export function addOrgCurator(req, res) {
    userByName(req.body.username, handle40x({req, res}, user => {
        let changed = false;
        if (user.orgCurator.indexOf(req.body.org) === -1) {
            user.orgCurator.push(req.body.org);
            changed = true;
        }
        if (!hasRole(user, 'CommentReviewer')) {
            user.roles.push('CommentReviewer');
            changed = true;
        }

        if (!changed) {
            return res.send();
        }
        user.save(handleError({req, res}, () => {
            res.send();
        }));
    }));
}

export function removeOrgCurator(req, res) {
    userById(req.body.userId, handle40x({req, res}, found => {
        const orgInd = found.orgCurator.indexOf(req.body.org);
        if (orgInd < 0) {
            return res.send();
        }
        found.orgCurator.splice(orgInd, 1);
        found.save(handleError({req, res}, () => {
            res.send();
        }));
    }));
}

export function addOrg(req, res) {
    const newOrg = req.body;
    if (newOrg.workingGroupOf) {
        orgByName(newOrg.workingGroupOf, function (err, parentOrg) {
            newOrg.classifications = parentOrg.classifications;
            addOrg(newOrg, res);
        });
    } else {
        addOrg(newOrg, res);
    }
}

export function transferSteward(req, res) {
    const results = [];
    let hasError = false;
    if (req.isAuthenticated() && isOrgAdmin(req.user, req.body.from) && isOrgAdmin(req.user, req.body.to)) {
        async.each(getDaoList(), function (dao, oneDone) {
            if (dao.transferSteward) {
                dao.transferSteward(req.body.from, req.body.to, function (err, result) {
                    if (err || Number.isNaN(result)) {
                        hasError = true;
                        results.push('Error transferring ' + dao.name + ' from ' + req.body.from + ' to ' + req.body.to + '. Please try again. ');
                    } else if (result === 0) {
                        results.push('There are no ' + dao.name + ' to transfer. ');
                    } else {
                        results.push(result + ' ' + dao.name + ' transferred. ');
                    }
                    oneDone();
                });
            } else {
                oneDone();
            }
        }, function allDone() {
            return res.status(hasError ? 400 : 200).send(results.join(''));
        });
    } else {
        res.status(400).send('Please login first.');
    }
}
