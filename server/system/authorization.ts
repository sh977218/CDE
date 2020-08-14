import { Request, RequestHandler, Response, NextFunction } from 'express';
import { handleNotFound } from 'server/errorHandler/errorHandler';
import {
    canComment, canEditCuratedItem, hasRole, isOrgAdmin, isOrgAuthority, isOrgCurator, isSiteAdmin
} from 'shared/system/authorizationShared';
import { Board, Item, User } from 'shared/models.model';

// --------------------------------------------------
// Middleware
// --------------------------------------------------

export function nocacheMiddleware(req: Request, res: Response, next: NextFunction) {
    if (req && req.headers['user-agent']) {
        if (req.headers['user-agent'].indexOf('Chrome') < 0 || req.headers['user-agent'].indexOf('Firefox') < 0) {
            res.header('Cache-Control', 'private, no-cache, no-store, must-revalidate');
            res.header('Expires', '-1');
            res.header('Pragma', 'no-cache');
        }
    }
    next();
}

export const canCreateMiddleware: RequestHandler = (req, res, next) => {
    loggedInMiddleware(req, res, () => {
        if (!canEditCuratedItem(req.user, req.body)) {
            // TODO: consider ban
            res.status(403).send();
            return;
        }
        next();
    });
};

export type RequestWithItem = Request;
// tslint:disable-next-line no-namespace (Node not-quite appropriate cache on some middleware)
declare global {
    namespace Express {
        export interface Request {
            item: Item;
            user?: any;
        }
    }
}

export const canEditMiddleware = (db: any) => (req: RequestWithItem, res: Response, next: NextFunction) => {
    loggedInMiddleware(req, res, () => {
        db.byExisting(req.body, handleNotFound({req, res}, (item: Item) => {
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

export const canEditByTinyIdMiddleware = (db: any) => (req: RequestWithItem, res: Response, next: NextFunction) => {
    if (!req.params.tinyId) {
        res.status(400).send();
        return;
    }
    isOrgCuratorMiddleware(req, res, () => {
        db.byTinyId(req.params.tinyId, handleNotFound({req, res}, (item: Item) => {
            if (!canEditCuratedItem(req.user, item)) {
                return res.status(403).send();
            }
            req.item = item;
            next();
        }));
    });
};

export const canCommentMiddleware: RequestHandler = (req, res, next) => {
    // TODO: not logged in should return 401, call loggedInMiddleware
    if (!canComment(req.user)) {
        res.status(403).send();
        return;
    }
    next();
};

export const canApproveCommentMiddleware: RequestHandler = (req, res, next) => {
    if (!hasRole(req.user, 'CommentReviewer')) {
        res.send(403).send();
        return;
    }
    next();
};

export const canApproveAttachmentMiddleware: RequestHandler = (req, res, next) => {
    if (!hasRole(req.user, 'AttachmentReviewer')) {
        res.send(403).send();
        return;
    }
    next();
};

export const isOrgAdminMiddleware: RequestHandler = (req, res, next) => {
    if (!isOrgAdmin(req.user, req.body.org)) {
        res.status(403).send();
        return;
    }
    next();
};

export const isOrgAuthorityMiddleware: RequestHandler = (req, res, next) => {
    if (!isOrgAuthority(req.user)) {
        res.status(403).send();
        return;
    }
    next();
};

export const isOrgCuratorMiddleware: RequestHandler = (req, res, next) => {
    if (!isOrgCurator(req.user)) {
        res.status(403).send();
        return;
    }
    next();
};

export const isSiteAdminMiddleware: RequestHandler = (req, res, next) => {
    if (!isSiteAdmin(req.user)) {
        res.status(403).send();
        return;
    }
    next();
};

export const loggedInMiddleware: RequestHandler = (req, res, next) => {
    if (!req.isAuthenticated()) {
        return res.status(401).send();
    }
    next();
};

// --------------------------------------------------
// Permission Helpers with Request/Response
// --------------------------------------------------

export function isDocumentationEditor(elt: Item, user?: User) {
    return hasRole(user, 'DocumentationEditor');
}

export function checkOwnership(elt: Item, user?: User) {
    return isOrgCurator(user, elt.stewardOrg.name);
}

export function checkBoardOwnerShip(board?: Board, user?: User) {
    if (!user || !board) {
        return false;
    }
    return board.owner.userId.equals(user._id);
}

export function checkBoardViewerShip(board?: Board, user?: User) {
    if (!user || !board) {
        return false;
    }
    const viewers = board.users.filter(u => u.role === 'viewer').map(u => u.username.toLowerCase());
    return viewers.indexOf(user.username.toLowerCase()) > -1 || checkBoardOwnerShip(board, user);
}

export function unauthorizedPublishing(user: User, board: Board) {
    return board.shareStatus === 'Public' && !hasRole(user, 'BoardPublisher');
}
