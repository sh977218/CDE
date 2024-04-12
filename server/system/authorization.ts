import { Request, RequestHandler, Response, NextFunction } from 'express';
import { respondError } from 'server/errorHandler';
import {
    canAttach,
    canBundle,
    canEditArticle,
    canEditCuratedItem,
    canSubmissionReview,
    canSubmissionSubmit,
    canViewComment,
    hasPrivilegeForOrg,
    hasPrivilegeInRoles,
    hasRole,
    isNlmCurator,
    isOrg,
    isOrgAdmin,
    isOrgAuthority,
    isOrgCurator,
    isSiteAdmin,
} from 'shared/security/authorizationShared';
import { Board, Item, User } from 'shared/models.model';
import { DataElementDb } from 'shared/boundaryInterfaces/db/dataElementDb';
import { FormDb } from 'shared/boundaryInterfaces/db/formDb';

// --------------------------------------------------
// Middleware
// --------------------------------------------------

export const loggedInMiddleware: RequestHandler = (req, res, next) => {
    if (!req.user) {
        return res.status(401).send();
    }
    next();
};

export const isNlmCuratorMiddleware: RequestHandler = (req, res, next) => {
    if (!isNlmCurator(req.user)) {
        res.status(403).send();
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

export const isOrgMiddleware: RequestHandler = (req, res, next) => {
    if (!isOrg(req.user)) {
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

export const nocacheMiddleware: RequestHandler = (req, res, next) => {
    if (req && req.headers['user-agent']) {
        if (req.headers['user-agent'].indexOf('Chrome') < 0 || req.headers['user-agent'].indexOf('Firefox') < 0) {
            res.header('Cache-Control', 'private, no-cache, no-store, must-revalidate');
            res.header('Expires', '-1');
            res.header('Pragma', 'no-cache');
        }
    }
    next();
};

export const canAttachMiddleware: RequestHandler = (req, res, next) => {
    loggedInMiddleware(req, res, () => {
        if (!canAttach(req.user)) {
            res.status(403).send();
            return;
        }
        next();
    });
};

export const canBundleMiddleware: RequestHandler = (req, res, next) => {
    loggedInMiddleware(req, res, () => {
        if (!canBundle(req.user)) {
            res.status(403).send();
            return;
        }
        next();
    });
};

export const canCreateMiddleware: RequestHandler = (req, res, next) => {
    loggedInMiddleware(req, res, () => {
        if (!hasPrivilegeForOrg(req.user, 'create', req.body.stewardOrg.name)) {
            res.status(403).send();
            return;
        }
        next();
    });
};

export type RequestWithItem = Request;

export const canEditMiddleware =
    (db: DataElementDb | FormDb) => (req: RequestWithItem, res: Response, next: NextFunction) => {
        loggedInMiddleware(req, res, () => {
            db.byExisting(req.body).then(item => {
                if (!item) {
                    return res.status(404).send();
                }
                if (!canEditCuratedItem(req.user, item)) {
                    return res.status(403).send();
                }
                req.item = item;
                next();
            }, respondError({ req, res }));
        });
    };

export const canEditByTinyIdMiddleware =
    (db: DataElementDb | FormDb) => (req: RequestWithItem, res: Response, next: NextFunction) => {
        if (!req.params.tinyId) {
            return res.status(400).send();
        }
        if (hasPrivilegeInRoles(req.user, 'edit')) {
            next();
            return;
        }
        isOrgMiddleware(req, res, () => {
            db.byTinyId(req.params.tinyId).then(item => {
                if (!item) {
                    return res.status(404).send();
                }
                if (!canEditCuratedItem(req.user, item)) {
                    return res.status(403).send();
                }
                req.item = item;
                next();
            }, respondError({ req, res }));
        });
    };

export const canEditArticleMiddleware: RequestHandler = (req, res, next) => {
    if (canEditArticle(req.user)) {
        next();
    } else {
        return res.status(401).send();
    }
};

export const canSeeCommentMiddleware: RequestHandler = (req, res, next) => {
    if (req.isAuthenticated() && canViewComment(req.user)) {
        next();
    } else {
        return res.status(401).send();
    }
};

export const canSubmissionReviewMiddleware: RequestHandler = (req, res, next) => {
    if (!canSubmissionReview(req.user)) {
        res.status(403).send();
        return;
    }
    next();
};

export const canSubmissionSubmitMiddleware: RequestHandler = (req, res, next) => {
    if (!canSubmissionSubmit(req.user)) {
        res.status(403).send();
        return;
    }
    next();
};

// --------------------------------------------------
// Permission Helpers with Request/Response
// --------------------------------------------------

export function checkEditing(elt: Item, user?: User) {
    return canEditCuratedItem(user, elt);
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
    if (isSiteAdmin(user)) {
        return true;
    }
    const viewers = board.users.filter(u => u.role === 'viewer').map(u => u.username.toLowerCase());
    return viewers.indexOf(user.username.toLowerCase()) > -1 || checkBoardOwnerShip(board, user);
}

export function unauthorizedPublishing(user: User, board: Board) {
    return board.shareStatus === 'Public' && !(hasRole(user, 'BoardPublisher') || isOrgCurator(user));
}
