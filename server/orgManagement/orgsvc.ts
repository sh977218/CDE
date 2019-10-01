import { remove } from 'lodash';
import { findOneByName, saveOrg, updateOrgById } from 'server/orgManagement/orgDb';
import { transferSteward as cdeTransferSteward } from 'server/cde/mongo-cde';
import { transferSteward as formTransferSteward } from 'server/form/mongo-form';
import { hasRole } from 'shared/system/authorizationShared';
import { usersByOrgAdmins, usersByOrgCurators } from 'server/user/userDb';

export async function orgByName(orgName) {
    return findOneByName(orgName);
}


export async function myOrgsAdmins(user) {
    const users = await usersByOrgAdmins(user.orgAdmin);
    return users;
}

export async function orgCurators(user) {
    const users = await usersByOrgCurators(user.orgCurator);
    return users;
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

