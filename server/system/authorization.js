const authorizationShared = require('@std/esm')(module)('../../shared/system/authorizationShared');
const mongo_board = require('../board/mongo-board');

exports.checkOwnership = function (dao, id, req, cb) {
    if (!req.isAuthenticated()) return cb("You are not authorized.", null);
    dao.byId(id, function (err, elt) {
        if (err || !elt) return cb("Element does not exist.", null);
        if (!authorizationShared.isOrgCurator(req.user, elt.stewardOrg.name))
            return cb("You do not own this element.", null);
        cb(null, elt);
    });
};

// Check if user is site admin or org admin for at least one org
exports.isSiteOrgAdmin = function (req) {
    return req.isAuthenticated() && authorizationShared.isOrgAdmin(req.user);
};

exports.isOrgAdmin = function (req, org) {
    return req.isAuthenticated() && authorizationShared.isOrgAdmin(req.user, org);
};

exports.checkSiteAdmin = function (req, res, next) {
    if (req.isAuthenticated() && req.user.siteAdmin)
        return next();
    return res.status(401).send();
};

exports.boardOwnership = function (req, res, boardId, next) {
    if (!req.isAuthenticated()) return res.status(401).send("You must be logged in to do this.");
    mongo_board.boardById(boardId, function (err, board) {
        if (err) return res.status(500).send("ERROR - cannot find board ownership by id.");
        if (!board) return res.status(404).send();
        if (JSON.stringify(board.owner.userId) !== JSON.stringify(req.user._id))
            return res.status(401).send();
        next(board);
    });
};


exports.allowCreate = function (user, elt, cb) {
    if (!elt.stewardOrg.name) return cb("Missing Steward");
    if (user.orgCurator.indexOf(elt.stewardOrg.name) < 0 &&
        user.orgAdmin.indexOf(elt.stewardOrg.name) < 0 &&
        !user.siteAdmin)
        return cb("Not authorized");
    if (elt.registrationState && elt.registrationState.registrationStatus &&
        ((elt.registrationState.registrationStatus === "Standard" ||
            elt.registrationState.registrationStatus === " Preferred Standard") &&
            !user.siteAdmin))
        return cb("Not authorized");
    cb();
};

exports.allowUpdate = function (user, item, cb) {
    return cb(authorizationShared.canEditCuratedItem(user, item) ? 'Not authorized' : undefined);
};