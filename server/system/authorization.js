const authorizationShared = require('@std/esm')(module)('../../shared/system/authorizationShared');

// --------------------------------------------------
// Middleware

exports.nocacheMiddleware = function (req, res, next) {
    if (req && req.headers['user-agent']) {
        if (req.headers['user-agent'].indexOf("Chrome") < 0 || req.headers['user-agent'].indexOf("Firefox") < 0) {
            res.header('Cache-Control', 'private, no-cache, no-store, must-revalidate');
            res.header('Expires', '-1');
            res.header('Pragma', 'no-cache');
        }
    }
    next();
};

exports.canEditMiddleware = function (req, res, next) {
    exports.loggedInMiddleware(req, res, () => {
        if (!authorizationShared.canEditCuratedItem(req.user, req.body)) {
            // TODO: consider ban
            res.status(403).send();
            return;
        }
        next();
    });
};

exports.canCommentMiddleware = function (req, res, next) {
    // TODO: not logged in should return 401, call loggedInMiddleware
    if (!authorizationShared.canComment(req.user)) {
        res.status(403).send();
        return;
    }
    next();
};

exports.canApproveCommentMiddleware = function (req, res, next) {
    if (!authorizationShared.hasRole(req.user, 'CommentReviewer')) {
        res.send(403).send();
        return;
    }
    next();
};

exports.isOrgAdminMiddleware = (req, res, next) => {
    if (!authorizationShared.isOrgAdmin(req.user, req.body.org)) {
        res.status(403).send();
        return;
    }
    next();
};

exports.isOrgAuthorityMiddleware = (req, res, next) => {
    if (!authorizationShared.isOrgAuthority(req.user)) {
        res.status(403).send();
        return;
    }
    next();
};

exports.isOrgCuratorMiddleware = (req, res, next) => {
    if (!authorizationShared.isOrgCurator(req.user)) {
        res.status(403).send();
        return;
    }
    next();
};

exports.isSiteAdminMiddleware = (req, res, next) => {
    if (!authorizationShared.isSiteAdmin(req.user)) {
        res.status(403).send();
        return;
    }
    next();
};

exports.loggedInMiddleware = function (req, res, next) {
    if (!req.isAuthenticated()) {
        res.status(401).send();
        return;
    }
    next();
};

// --------------------------------------------------
// Permission Helpers with Request/Response
// --------------------------------------------------

exports.checkBoardOwnerShip = function (board, user) {
    if (!user || !board) return false;
    return board.owner.userId.equals(user._id);
};

exports.checkBoardViewerShip = function (board, user) {
    if (!user || !board) return false;
    let viewers = board.users.filter(u => u.role === 'viewer' || u.role === 'reviewer').map(u => u.username.toLowerCase());
    return viewers.indexOf(user.username.toLowerCase()) > -1 || exports.checkBoardOwnerShip(board, user);
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

exports.unauthorizedPublishing = function (user, board) {
    return board.shareStatus === "Public" && !authorizationShared.hasRole(user, "BoardPublisher");
};