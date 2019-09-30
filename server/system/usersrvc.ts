import { orgAdmins as userOrgAdmins, userById, userByName } from './mongo-data';
import { handle40x, handleError } from 'server/errorHandler/errorHandler';
import { User } from 'shared/models.model';

export function myOrgs(user: User): string[] {
    if (!user) {
        return [];
    }
    return user.orgAdmin.concat(user.orgCurator);
}

export function updateUserRoles(req, res) {
    const user = req.body;
    userByName(user.username, handle40x({req, res}, found => {
        found.roles = user.roles;
        found.save(handleError({req, res}, () => {
            res.send();
        }));
    }));
}

export function updateUserAvatar(req, res) {
    let user = req.body;
    userByName(user.username, handle40x({req, res}, found => {
        found.avatarUrl = user.avatarUrl;
        found.save(handleError({req, res}, () => {
            res.send();
        }));
    }));
}

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
