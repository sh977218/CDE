import { Request, Response } from 'express';
import { respondError } from 'server/errorHandler';
import { dataElementModel } from 'server/mongo/mongoose/dataElement.mongoose';
import { formModel } from 'server/mongo/mongoose/form.mongoose';
import { addOrgByName, managedOrgs, orgByName } from 'server/orgManagement/orgDb';
import {
    byId,
    orgAdmins as userOrgAdmins,
    orgCurators as userOrgCurators,
    orgEditors as userOrgEditors,
    userByName,
} from 'server/user/userDb';
import { concat } from 'shared/array';
import { OrgManageAddRequestHandler, OrgManageRemoveRequestHandler } from 'shared/boundaryInterfaces/API/orgManagement';
import { User } from 'shared/models.model';
import { Organization } from 'shared/organization/organization';
import { isOrgAdmin } from 'shared/security/authorizationShared';

export function myOrgs(user?: User): string[] {
    if (!user) {
        return [];
    }

    return concat(user.orgAdmin, user.orgCurator, user.orgEditor);
}

export async function myOrgsAdmins(user: User) {
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

export function orgCurators(req: Request, res: Response): Promise<Response> {
    return userOrgCurators(req.user.orgAdmin).then(users => {
        return res.send(
            (req.user as User).orgAdmin
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
    }, respondError({ req, res }));
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
            })),
    }));
}

export function orgEditors(req: Request, res: Response): Promise<Response> {
    return userOrgEditors(req.user.orgAdmin).then(users => {
        return res.send(
            (req.user as User).orgAdmin
                .map(org => ({
                    name: org,
                    users: users
                        .filter(user => user.orgEditor.indexOf(org) > -1)
                        .map(user => ({
                            _id: user._id,
                            username: user.username,
                        })),
                }))
                .filter(org => org.users.length > 0)
        );
    }, respondError({ req, res }));
}

export const addOrgAdmin: OrgManageAddRequestHandler = (req, res): Promise<Response> => {
    return userByName(req.body.username).then(user => {
        if (!user) {
            return res.status(404).send();
        }
        if (user.orgAdmin.indexOf(req.body.org) === -1) {
            user.orgAdmin.push(req.body.org);
        }
        return user.save().then(() => res.send(), respondError({ req, res }));
    }, respondError({ req, res }));
};

export const removeOrgAdmin: OrgManageRemoveRequestHandler = (req, res): Promise<Response> => {
    return byId(req.body.userId).then(user => {
        if (!user) {
            return res.status(404).send();
        }
        user.orgAdmin = user.orgAdmin.filter(a => a !== req.body.org);
        return user.save().then(() => res.send(), respondError({ req, res }));
    }, respondError({ req, res }));
};

export const addOrgCurator: OrgManageAddRequestHandler = (req, res): Promise<Response> => {
    return userByName(req.body.username).then(user => {
        if (!user) {
            return res.status(404).send();
        }
        if (user.orgCurator.indexOf(req.body.org) === -1) {
            user.orgCurator.push(req.body.org);
        }
        return user.save().then(() => res.send(), respondError({ req, res }));
    }, respondError({ req, res }));
};

export const removeOrgCurator: OrgManageRemoveRequestHandler = (req, res): Promise<Response> => {
    return byId(req.body.userId).then(user => {
        if (!user) {
            return res.status(404).send();
        }
        user.orgCurator = user.orgCurator.filter(a => a !== req.body.org);
        return user.save().then(() => res.send(), respondError({ req, res }));
    }, respondError({ req, res }));
};

export const addOrgEditor: OrgManageAddRequestHandler = (req, res): Promise<Response> => {
    return userByName(req.body.username).then(user => {
        if (!user) {
            return res.status(404).send();
        }
        if (user.orgEditor.indexOf(req.body.org) === -1) {
            user.orgEditor.push(req.body.org);
        }
        return user.save().then(() => res.send(), respondError({ req, res }));
    }, respondError({ req, res }));
};

export const removeOrgEditor: OrgManageRemoveRequestHandler = (req, res): Promise<Response> => {
    return byId(req.body.userId).then(user => {
        if (!user) {
            return res.status(404).send();
        }
        user.orgEditor = user.orgEditor.filter(a => a !== req.body.org);
        return user.save().then(() => res.send(), respondError({ req, res }));
    }, respondError({ req, res }));
};

export async function addNewOrg(newOrg: Organization) {
    if (newOrg.workingGroupOf) {
        const parentOrg = await orgByName(newOrg.workingGroupOf);
        if (parentOrg) {
            newOrg.classifications = parentOrg.classifications;
        }
    }
    return addOrgByName(newOrg);
}

export async function transferSteward(req: Request, res: Response) {
    const results: string[] = [];
    const from = req.body.from;
    const to = req.body.to;
    if (isOrgAdmin(req.user, req.body.from) && isOrgAdmin(req.user, req.body.to)) {
        let result = await dataElementModel.updateMany(
            { 'stewardOrg.name': from },
            { $set: { 'stewardOrg.name': to } }
        );
        results.push(result.modifiedCount + ' CDEs transferred. ');

        result = await formModel.updateMany({ 'stewardOrg.name': from }, { $set: { 'stewardOrg.name': to } });
        results.push(result.modifiedCount + ' forms transferred. ');
        return res.send(results.join(''));
    } else {
        res.status(403).send();
    }
}
