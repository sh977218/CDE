import { userByName } from 'server/user/userDb';
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
