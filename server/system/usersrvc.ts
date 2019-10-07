import { handleError, handleNotFound } from 'server/errorHandler/errorHandler';
import { User } from 'shared/models.model';
import { userByName, UserDocument } from 'server/user/userDb';

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