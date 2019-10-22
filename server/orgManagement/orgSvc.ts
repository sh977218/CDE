import { orgAdmins as userOrgAdmins, orgCurators as userOrgCurators, userById, userByName } from 'server/user/userDb';
import { addOrgByName, managedOrgs, orgByName } from 'server/orgManagement/orgDb';
import { handleNotFound, handleError } from 'server/errorHandler/errorHandler';
import { hasRole, isOrgAdmin } from 'shared/system/authorizationShared';
import { dataElementModel } from 'server/cde/mongo-cde';
import { formModel } from 'server/form/mongo-form';
import { User } from 'shared/models.model';

const async = require('async');


export function myOrgs(user: User): string[] {
    if (!user) {
        return [];
    }
    return user.orgAdmin.concat(user.orgCurator);
}

export async function myOrgsAdmins(user) {
    const users = await userOrgAdmins();
    return user.orgAdmin
        .map(org => ({
            name: org,
            users: users
                .filter(u => u.orgAdmin.indexOf(org) > -1)
                .map(u => ({
                    _id: u._id,
                    username: u.username,
                })),
        }))
        .filter(r => r.users.length > 0);
}

export function orgCurators(req, res) {
    userOrgCurators(req.user.orgAdmin, handleNotFound({req, res}, users => {
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

export async function orgAdmins() {
    const orgs = await managedOrgs();
    const users = await userOrgAdmins();
    return orgs.map(mo => ({
        name: mo.name,
        users: users
            .filter(u => u.orgAdmin.indexOf(mo.name) > -1)
            .map(u => ({
                _id: u._id,
                username: u.username,
            }))
    }));
}

export function addOrgAdmin(req, res) {
    userByName(req.body.username, handleNotFound({req, res}, user => {
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
    userById(req.body.userId, handleNotFound({req, res}, found => {
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
    userByName(req.body.username, handleNotFound({req, res}, user => {
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
    userById(req.body.userId, handleNotFound({req, res}, found => {
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

export async function addNewOrg(newOrg) {
    if (newOrg.workingGroupOf) {
        const parentOrg = await orgByName(newOrg.workingGroupOf);
        newOrg.classifications = parentOrg.classifications;
    }
    return addOrgByName(newOrg);
}

export function transferSteward(req, res) {
    const results: string[] = [];
    const from = req.body.from;
    const to = req.body.to;
    if (req.isAuthenticated() && isOrgAdmin(req.user, req.body.from) && isOrgAdmin(req.user, req.body.to)) {
        async.parallel([
            doneOne => {
                dataElementModel.updateMany({'stewardOrg.name': from}, {$set: {'stewardOrg.name': to}}, (err, result) => {
                    if (err) {
                        doneOne(err);
                    } else {
                        results.push(result.nModified + ' CDEs transferred. ');
                        doneOne();
                    }
                });
            },
            doneOne => {
                formModel.updateMany({'stewardOrg.name': from}, {$set: {'stewardOrg.name': to}}, (err, result) => {
                    if (err) {
                        doneOne(err);
                    } else {
                        results.push(result.nModified + ' forms transferred. ');
                        doneOne();
                    }
                });
            }
        ], err => {
            return res.status(err ? 400 : 200).send(results.join(''));
        });
    } else {
        res.status(400).send('Please login first.');
    }
}
