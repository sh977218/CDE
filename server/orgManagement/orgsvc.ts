import { remove } from 'lodash';
import { findOneByName, Org, saveOrg, updateOrgById } from 'server/orgManagement/orgDb';
import { transferSteward as cdeTransferSteward } from 'server/cde/mongo-cde';
import { transferSteward as formTransferSteward } from 'server/form/mongo-form';
import { hasRole } from 'shared/system/authorizationShared';
import { orgAdmins as userOrgAdmins, orgCurators as userOrgCurators } from 'server/system/mongo-data';
import { handle40x } from 'server/errorHandler/errorHandler';

export async function orgByName(orgName) {
    return findOneByName(orgName);
}


export async function myOrgsAdmins(user) {

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

export async function transferSteward(from, to) {
    const results: any[] = [];
    const cdeResult = await cdeTransferSteward(from, to);
    results.push(cdeResult.nModified + ' cdes transferred. ');
    const formResult = await formTransferSteward(from, to);
    results.push(formResult.nModified + ' forms transferred. ');
    return results;
}

export async function addOrganization(newOrg) {
    const existingOrg = await findOneByName(newOrg.name);
    if (existingOrg) {
        throw new Error('Org Already Exists');
    } else {
        if (newOrg.workingGroupOf) {
            const parentOrg = await findOneByName(newOrg.workingGroupOf);
            newOrg.classifications = parentOrg.classifications;
        }
        const savedOrg = await saveOrg(newOrg);
        return savedOrg;
    }
}

export async function updateOrg(org) {
    const id = org._id;
    delete org._id;
    const updatedOrg = updateOrgById(id, org);
    return updatedOrg;
}


export async function removeOrgCurator(user, orgName) {
    remove(user.orgCurator, o => o === orgName);
    const savedUser = await user.save();
    return savedUser;
}

export async function addOrgCurator(user, orgName) {
    if (user.orgCurator.indexOf(orgName) === -1) {
        user.orgCurator.push(orgName);
    }
    if (!hasRole(user, 'CommentReviewer')) {
        user.roles.push('CommentReviewer');
    }
    const savedUser = await user.save();
    return savedUser;
}


export async function removeOrgAdmin(user, orgName) {
    remove(user.orgAdmin, o => o === orgName);
    const savedUser = await user.save();
    return savedUser;
}

export async function addOrgAdmin(user, orgName) {
    if (user.orgCurator.indexOf(orgName) === -1) {
        user.orgCurator.push(orgName);
    }
    if (!hasRole(user, 'CommentReviewer')) {
        user.roles.push('CommentReviewer');
    }
    const savedUser = await user.save();
    return savedUser;
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


