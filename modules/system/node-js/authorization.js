var authorizationShared = require('../shared/authorizationShared');

exports.checkOwnership = function(dao, id, req, cb) {
    if (req.isAuthenticated()) {
        dao.byId(id, function (err, elt) {
            if (err || !elt) {
                return cb("Element does not exist.", null);
            }
            if (!authorizationShared.isCuratorOf(req.user,elt.stewardOrg.name)) {
                return cb("You do not own this element.", null);
            } else {
                cb(null, elt);
            }
        });
    } else {
        return cb("You are not authorized.", null);                   
    }
};

// Check if user is site admin or org admin for at least one org
exports.isSiteOrgAdmin = function(req) {
    return !!(req.isAuthenticated() && (req.user.siteAdmin || (req.user.orgAdmin && req.user.orgAdmin.length >= 0)));
};

exports.isOrgAdmin = function(req, org) {
    return req.isAuthenticated() &&
        (authorizationShared.hasRole(req.user, "OrgAuthority") || req.user.orgAdmin.indexOf(org) >= 0);
};

exports.checkSiteAdmin = function(req, res, next) {
    if (req.isAuthenticated() && req.user.siteAdmin) {
        next();
    } else {
        res.status(401).send();
    }
};

exports.boardOwnership = function (req, res, next) {
    if (req.isAuthenticated()) {
        mongo_cde.boardById(req.params.boardId, function (err, board) {
            if (!board) {
                res.status(500).send("Can not find board with id:" + req.params.boardId);
            } else if (JSON.stringify(board.owner.userId) !== JSON.stringify(req.user._id)) {
                res.status(401).send("You must own the board that you wish to delete.");
            } else {
                next();
            }
        });
    } else {
        res.status(401).send("You must be logged in to do this.");
    }
};