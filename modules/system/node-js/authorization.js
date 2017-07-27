let authorizationShared = require('../shared/authorizationShared');
let mongo_board = require('../../board/node-js/mongo-board');

exports.checkOwnership = function (dao, id, req, cb) {
    if (!req.isAuthenticated()) return cb("You are not authorized.", null);
    dao.byId(id, function (err, elt) {
        if (err || !elt) return cb("Element does not exist.", null);
        if (!authorizationShared.isCuratorOf(req.user, elt.stewardOrg.name))
            return cb("You do not own this element.", null);
        cb(null, elt);
    });
};

// Check if user is site admin or org admin for at least one org
exports.isSiteOrgAdmin = function (req) {
    return !!(req.isAuthenticated() && (req.user.siteAdmin || (req.user.orgAdmin && req.user.orgAdmin.length >= 0)));
};

exports.isOrgAdmin = function (req, org) {
    return req.isAuthenticated() &&
        (authorizationShared.hasRole(req.user, "OrgAuthority") ||
            req.user.orgAdmin.indexOf(org) >= 0);
};

exports.checkSiteAdmin = function (req, res, next) {
    if (req.isAuthenticated() && req.user.siteAdmin)
        return next();
    return res.status(401).send();
};

exports.boardOwnership = function (req, res, boardId, next) {
    if (!req.isAuthenticated()) return res.status(401).send("You must be logged in to do this.");
    mongo_board.boardById(boardId, function (err, board) {
        if (err) return res.status(500).send(err);
        if (!board) return res.status(404).send();
        if (JSON.stringify(board.owner.userId) !== JSON.stringify(req.user._id))
            return res.status(401).send();
        next(board);
    });
};