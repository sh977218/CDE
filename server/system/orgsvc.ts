import { isOrgAdmin } from '../../shared/system/authorizationShared';

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
    let results = [];
    let hasError = false;
    if (req.isAuthenticated() && isOrgAdmin(req.user, req.body.from) && isOrgAdmin(req.user, req.body.to)) {
        async.each(daoManager.getDaoList(), function(dao, oneDone) {
            if (dao.transferSteward) {
                dao.transferSteward(req.body.from, req.body.to, function(err, result) {
                    if (err || Number.isNaN(result)) {
                        hasError = true;
                        results.push( 'Error transferring ' + dao.name + ' from ' + req.body.from + ' to ' + req.body.to + '. Please try again. ');
                    } else if (result === 0) {
                        results.push( 'There are no ' + dao.name + ' to transfer. ');
                    } else {
                        results.push(result + ' ' + dao.name + ' transferred. ');
                    }
                    oneDone();
                });
            } else oneDone();
        }, function allDone() {
            return res.status(hasError ? 400 : 200).send(results.join(''));
        });
    } else {
        res.status(400).send("Please login first.");
    }
}
