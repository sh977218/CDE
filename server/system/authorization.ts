import {
    canComment, canEditCuratedItem, hasRole, isOrgAdmin, isOrgAuthority, isOrgCurator, isSiteAdmin
} from 'shared/system/authorizationShared';
import { handle40x } from '../errorHandler/errorHandler';

// --------------------------------------------------
// Middleware

export function nocacheMiddleware(req, res, next) {
    if (req && req.headers['user-agent']) {
        if (req.headers['user-agent'].indexOf("Chrome") < 0 || req.headers['user-agent'].indexOf("Firefox") < 0) {
            res.header('Cache-Control', 'private, no-cache, no-store, must-revalidate');
            res.header('Expires', '-1');
            res.header('Pragma', 'no-cache');
        }
    }
    next();
}

export function canCreateMiddleware(req, res, next) {
    loggedInMiddleware(req, res, () => {
        if (!canEditCuratedItem(req.user, req.body)) {
            // TODO: consider ban
            res.status(403).send();
            return;
        }
        next();
    });
}

export const canEditMiddleware = db => (req, res, next) => {
    loggedInMiddleware(req, res, () => {
        db.byExisting(req.body, handle40x({req, res}, item => {
            if (!canEditCuratedItem(req.user, item)) {
                // TODO: consider ban
                res.status(403).send();
                return;
            }
            req.item = item;
            next();
        }));
    });
};

export const canEditByTinyIdMiddleware = db => (req, res, next) => {
    if (!req.params.tinyId) {
        res.status(400).send();
        return;
    }
    isOrgCuratorMiddleware(req, res, () => {
        db.byTinyId(req.params.tinyId, handle40x({req, res}, item => {
            if (!canEditCuratedItem(req.user, item)) {
                return res.status(403).send();
            }
            req.item = item;
            next();
        }));
    });
};

export function canCommentMiddleware(req, res, next) {
    // TODO: not logged in should return 401, call loggedInMiddleware
    if (!canComment(req.user)) {
        res.status(403).send();
        return;
    }
    next();
}

export function canApproveCommentMiddleware(req, res, next) {
    if (!hasRole(req.user, 'CommentReviewer')) {
        res.send(403).send();
        return;
    }
    next();
}

export function canApproveAttachmentMiddleware(req, res, next) {
    if (!hasRole(req.user, 'AttachmentReviewer')) {
        res.send(403).send();
        return;
    }
    next();
}

export function isOrgAdminMiddleware(req, res, next) {
    if (!isOrgAdmin(req.user, req.body.org)) {
        res.status(403).send();
        return;
    }
    next();
}

export function isOrgAuthorityMiddleware(req, res, next) {
    if (!isOrgAuthority(req.user)) {
        res.status(403).send();
        return;
    }
    next();
}

export function isOrgCuratorMiddleware(req, res, next) {
    if (!isOrgCurator(req.user)) {
        res.status(403).send();
        return;
    }
    next();
}

export function isSiteAdminMiddleware(req, res, next) {
    if (!isSiteAdmin(req.user)) {
        res.status(403).send();
        return;
    }
    next();
}

export function loggedInMiddleware(req, res, next) {
    if (!req.isAuthenticated()) return res.status(401).send();
    next();
}

// --------------------------------------------------
// Permission Helpers with Request/Response
// --------------------------------------------------

export function isDocumentationEditor(elt, user) {
    return hasRole(user, 'DocumentationEditor');
}

export function checkOwnership(elt, user) {
    return isOrgCurator(user, elt.stewardOrg.name);
}

export function checkBoardOwnerShip(board, user) {
    if (!user || !board) return false;
    return board.owner.userId.equals(user._id);
}

export function checkBoardViewerShip(board, user) {
    if (!user || !board) return false;
    let viewers = board.users.filter(u => u.role === 'viewer').map(u => u.username.toLowerCase());
    return viewers.indexOf(user.username.toLowerCase()) > -1 || checkBoardOwnerShip(board, user);
}

export function unauthorizedPublishing(user, board) {
    return board.shareStatus === "Public" && !hasRole(user, "BoardPublisher");
}
