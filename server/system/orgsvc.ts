import { parallel } from 'async';
import { RequestHandler } from 'express';
import { dataElementModel } from 'server/cde/mongo-cde';
import { handleNotFound } from 'server/errorHandler/errorHandler';
import { formModel } from 'server/form/mongo-form';
import { addOrg as addOrganization, managedOrgs as managedOrganizations, orgByName } from 'server/system/mongo-data';
import { isOrgAdmin } from 'shared/system/authorizationShared';
import { Organization } from 'shared/models.model';

export const managedOrgs: RequestHandler = (req, res) => {
    managedOrganizations((err, orgs) => {
        res.send(orgs);
    });
};

export const addOrg: RequestHandler = (req, res) => {
    const newOrg: Organization = req.body;
    if (newOrg.workingGroupOf) {
        orgByName(newOrg.workingGroupOf, handleNotFound({req, res}, parentOrg => {
            newOrg.classifications = parentOrg.classifications;
            addOrganization(newOrg, res);
        }));
    } else {
        addOrganization(newOrg, res);
    }
};

export const transferSteward: RequestHandler = (req, res) => {
    const results: string[] = [];
    const from = req.body.from;
    const to = req.body.to;
    if (req.isAuthenticated() && isOrgAdmin(req.user, req.body.from) && isOrgAdmin(req.user, req.body.to)) {
        parallel([
            doneOne => dataElementModel.updateMany({'stewardOrg.name': from}, {$set: {'stewardOrg.name': to}}, (err, result) => {
                if (err) {
                    doneOne(err);
                } else {
                    results.push(result.nModified + ' CDEs transferred. ');
                    doneOne();
                }
            }),
            doneOne => formModel.updateMany({'stewardOrg.name': from}, {$set: {'stewardOrg.name': to}}, (err, result) => {
                if (err) {
                    doneOne(err);
                } else {
                    results.push(result.nModified + ' forms transferred. ');
                    doneOne();
                }
            })
        ], err => {
            return res.status(err ? 400 : 200).send(results.join(''));
        });
    } else {
        res.status(400).send('Please login first.');
    }
};
