import { handleError, handleNotFound } from 'server/errorHandler/errorHandler';
import {
    getAllUsernames as userGetAllUsernames, managedOrgs, orgAdmins as userOrgAdmins, orgCurators as userOrgCurators,
    userById, userByName, UserDocument
} from 'server/system/mongo-data';
import { User } from 'shared/models.model';
import { hasRole } from 'shared/system/authorizationShared';

export function myOrgs(user: User): string[] {
    if (!user) {
        return [];
    }
    return user.orgAdmin.concat(user.orgCurator);
}

export function updateUserRoles(req, res) {
    const user = req.body;
    userByName(user.username, handleNotFound({req, res}, found => {
        found.roles = user.roles;
        found.save(handleError<UserDocument>({req, res}, () => {
            res.send();
        }));
    }));
}

export function updateUserAvatar(req, res) {
    const user = req.body;
    userByName(user.username, handleNotFound({req, res}, found => {
        found.avatarUrl = user.avatarUrl;
        found.save(handleError<UserDocument>({req, res}, () => {
            res.send();
        }));
    }));
}

export function myOrgsAdmins(req, res) {
    userById(req.user._id, handleNotFound({req, res}, foundUser => {
        userOrgAdmins(handleNotFound({req, res}, users => {
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
    userOrgCurators(req.user.orgAdmin, handleNotFound({req, res}, (users: User[]) => {
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
    managedOrgs(handleNotFound({req, res}, managedOrgs => {
        userOrgAdmins(handleNotFound({req, res}, (users) => {
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
        let orgInd = found.orgAdmin.indexOf(req.body.org);
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
        let orgInd = found.orgCurator.indexOf(req.body.org);
        if (orgInd < 0) {
            return res.send();
        }
        found.orgCurator.splice(orgInd, 1);
        found.save(handleError({req, res}, () => {
            res.send();
        }));
    }));
}

export function getAllUsernames(req, res) {
    userGetAllUsernames(handleError({req, res}, usernames => res.send(usernames)));
}
