const authorizationShared = require('@std/esm')(module)('../../shared/system/authorizationShared');

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

exports.canCommentMiddleware = function (req, res, next) {
    if (!req.user) return res.status(401).send();
    else if (!authorizationShared.canComment(req.user)) res.status(401).send();
    else next();
};

exports.canApproveCommentMiddleware = function (req, res, next) {
    if (authorizationShared.hasRole(req.user, "CommentReviewer")) next();
    else res.send(401).send();
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
    if (!authorizationShared.canOrgAuthority(req.user)) return res.status(403).send();
    next();
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

exports.checkBoardOwnerShip = function (board, user) {
    if (!user || !board) return false;
    return board.owner.userId.equal(user._id);
};

exports.checkBoardViewerShip = function (board, user) {
    if (!user || !board) return false;
    let viewers = board.users.filter(u => u.role === 'viewer' || u.role === 'reviewer').map(u => u.username.toLowerCase());
    return viewers.indexOf(user.username.toLowerCase()) > -1 || checkBoardOwnerShip(board, user);
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