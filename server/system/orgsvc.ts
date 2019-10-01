import { isOrgAdmin } from 'shared/system/authorizationShared';
import { DataElement } from 'server/cde/mongo-cde';
import { Form } from 'server/form/mongo-form';

const mongo_data = require('./mongo-data');
const daoManager = require('./moduleDaoManager');
const async = require('async');

export function managedOrgs(req, res) {
    mongo_data.managedOrgs(function (err, orgs) {
        res.send(orgs);
    });
}

export function addOrg(req, res) {
    let newOrg = req.body;
    if (newOrg.workingGroupOf) {
        mongo_data.orgByName(newOrg.workingGroupOf, function (err, parentOrg) {
            newOrg.classifications = parentOrg.classifications;
            mongo_data.addOrg(newOrg, res);
        });
    } else {
        mongo_data.addOrg(newOrg, res);
    }
}

export function transferSteward(req, res) {
    const results: string[] = [];
    const from = req.body.from;
    const to = req.body.to;
    if (req.isAuthenticated() && isOrgAdmin(req.user, req.body.from) && isOrgAdmin(req.user, req.body.to)) {
        async.parallel([
            doneOne => {
                DataElement.updateMany({'stewardOrg.name': from}, {$set: {'stewardOrg.name': to}}, (err, result) => {
                    if (err) {
                        doneOne(err);
                    } else {
                        results.push(result.nModified + ' cde transferred. ');
                        doneOne();
                    }
                });
            },
            doneOne => {
                Form.updateMany({'stewardOrg.name': from}, {$set: {'stewardOrg.name': to}}, (err, result) => {
                    if (err) {
                        doneOne(err);
                    } else {
                        results.push(result.nModified + ' form transferred. ');
                        doneOne();
                    }
                });
            }
        ], err => {
            return res.status(err ? 400 : 200).send(results.join(''));
        });
    } else {
        res.status(400).send("Please login first.");
    }
}
