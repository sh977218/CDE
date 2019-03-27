const authorizationShared = require('esm')(module)('../../shared/system/authorizationShared');
const dbLogger = require('../log/dbLogger');
const handle404 = dbLogger.handle404;

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

exports.canCreateMiddleware = (req, res, next) => {
    exports.loggedInMiddleware(req, res, () => {
        if (!authorizationShared.canEditCuratedItem(req.user, req.body)) {
            // TODO: consider ban
            res.status(403).send();
            return;
        }
        next();
    });
};

exports.canEditMiddleware = db => (req, res, next) => {
    exports.loggedInMiddleware(req, res, () => {
        db.byExisting(req.body, handle404({req, res}, item => {
            if (!authorizationShared.canEditCuratedItem(req.user, item)) {
                // TODO: consider ban
                res.status(403).send();
                return;
            }
            req.item = item;
            next();
        }));
    });
};

exports.canEditByTinyIdMiddleware = db => (req, res, next) => {
    if (!req.params.tinyId) {
        res.status(400).send();
        return;
    }
    exports.isOrgCuratorMiddleware(req, res, () => {
        db.byTinyId(req.params.tinyId, handle404({req, res}, item => {
            if (!authorizationShared.canEditCuratedItem(req.user, item)) {
                return res.status(403).send();
            }
            req.item = item;
            next();
        }));
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
exports.canApproveAttachmentMiddleware = function (req, res, next) {
    if (!authorizationShared.hasRole(req.user, 'AttachmentReviewer')) {
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
    if (!req.isAuthenticated()) return res.status(401).send();
    next();
};

// --------------------------------------------------
// Permission Helpers with Request/Response
// --------------------------------------------------

exports.isDocumentationEditor = function (elt, user) {
    return authorizationShared.hasRole(user, 'DocumentationEditor');
};

exports.checkOwnership = function (elt, user) {
    return authorizationShared.isOrgCurator(user, elt.stewardOrg.name);
};
exports.checkBoardOwnerShip = function (board, user) {
    if (!user || !board) return false;
    return board.owner.userId.equals(user._id);
};

exports.checkBoardViewerShip = function (board, user) {
    if (!user || !board) return false;
    let viewers = board.users.filter(u => u.role === 'viewer' || u.role === 'reviewer').map(u => u.username.toLowerCase());
    return viewers.indexOf(user.username.toLowerCase()) > -1 || exports.checkBoardOwnerShip(board, user);
};

exports.unauthorizedPublishing = function (user, board) {
    return board.shareStatus === "Public" && !authorizationShared.hasRole(user, "BoardPublisher");
};