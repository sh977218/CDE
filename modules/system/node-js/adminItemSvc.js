
exports.save = function(req, res, dao) {
    if (req.isAuthenticated()) {
        if (!req.body._id) {
            if (!req.body.stewardOrg.name) {
                res.send("Missing Steward");
            } else {
                if (req.user.orgCurator.indexOf(req.body.stewardOrg.name) < 0
                        && req.user.orgAdmin.indexOf(req.body.stewardOrg.name) < 0
                        && !req.user.siteAdmin) {
                    res.send(403, "not authorized");
                } else {
                    return dao.create(req, function(err, savedItem) {
                        res.send(savedItem);
                    });
                }
            }
        } else {
            return dao.byId(req.body._id, function(err, item) {
                if (item.archived === true) {
                    return res.send("Element is archived.");
                }
                if (req.user.orgCurator.indexOf(item.stewardOrg.name) < 0
                        && req.user.orgAdmin.indexOf(item.stewardOrg.name) < 0
                        && !req.user.siteAdmin) {
                    res.send(403, "not authorized");
                } else {
                    if ((item.registrationState.registrationStatus === "Standard" || item.registrationState.registrationStatus === "Preferred Standard")
                            && !req.user.siteAdmin) {
                        res.send("This record is already standard.");
                    } else {
                        if ((item.registrationState.registrationStatus !== "Standard" && item.registrationState.registrationStatus !== " Preferred Standard") &&
                                (req.body.registrationState.registrationStatus === "Standard" || req.body.registrationState.registrationStatus === "Preferred Standard")
                                && !req.user.siteAdmin
                                )
                        {
                            res.send(403, "not authorized");
                        } else {
                            return dao.update(req, function(err, savedItem) {
                                res.send(savedItem);
                            });
                        }
                    }
                }
            });
        }
    } else {
        res.send(403, "You are not authorized to do this.");
    }
}