import { RequestHandler } from 'express';
import { User } from 'shared/models.model';

interface OrgManageRemoveRequest {
    org: string;
    userId: string;
}

interface OrgManageAddRequest {
    org: string;
    username: string;
}

type OrgManageAddRequestHandler = RequestHandler<{}, OrgManageResponse, OrgManageAddRequest, never, User>
type OrgManageRemoveRequestHandler = RequestHandler<{}, OrgManageResponse, OrgManageRemoveRequest, never, User>
type OrgManageResponse = void;
