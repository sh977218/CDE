const authorizationShared = require('@std/esm')(module)('../../shared/system/authorizationShared');
const mongo_board = require('../board/mongo-board');

// Middleware
exports.isAuthenticatedMiddleware = function (req, res, next) {
    if (req.isAuthenticated()) next();
    else res.status(401).send();
};
exports.canEditMiddleware = function (req, res, next) {
    if (!authorizationShared.canEditCuratedItem(req.user, req.body)) {
        // TODO: should consider adding to error log
        return res.status(403).send();
    }
    if (next) next();
};

exports.canCommentMiddleware = function (user) {
    return authorizationShared.hasRole(user, "CommentAuthor")
        || authorizationShared.hasRole(user, "CommentReviewer")
        || authorizationShared.isOrgCurator(user);
};

exports.canApproveCommentMiddleware = function (req, res, next) {
    if (authorizationShared.hasRole(req.user, "CommentReviewer")) next();
    else res.send(401).send();
};

exports.isAuthenticatedMiddleware = function (req, res, next) {
    if (req.isAuthenticated()) next();
    else res.status(401).send();
};
exports.isOrgAdminMiddleware = (req, res, next) => {
    if (!req.isAuthenticated() || !authorizationShared.isOrgAdmin(req.user, req.body.org)) {
        return res.status(403).send();
    }
    if (next) {
        next();
    }
};

exports.isOrgAuthorityMiddleware = (req, res, next) => {
    if (!authorizationShared.canOrgAuthority(req.user)) {
        return res.status(403).send();
    }
    if (next) {
        next();
    }
};

exports.isSiteAdminMiddleware = (req, res, next) => {
    if (!req.isAuthenticated() || !authorizationShared.isSiteAdmin(req.user)) {
        return res.status(403).send();
    }
    if (next) {
        next();
    }
};

exports.loggedInMiddleware = function (req, res, next) {
    if (!req.user) return res.status(401).send();
    if (next) next();
};

// Permission Helpers with Request/Response
exports.checkOwnership = function (dao, id, req, cb) {
    if (!req.isAuthenticated()) return cb("You are not authorized.", null);
    dao.byId(id, function (err, elt) {
        if (err || !elt) return cb("Element does not exist.", null);
        if (!authorizationShared.isOrgCurator(req.user, elt.stewardOrg.name))
            return cb("You do not own this element.", null);
        cb(null, elt);
    });
};

exports.boardOwnership = function (req, res, boardId, next) {
    if (!req.isAuthenticated()) return res.status(401).send();
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
    return cb(authorizationShared.canEditCuratedItem(user, item) ? undefined : 'Not authorized');
};