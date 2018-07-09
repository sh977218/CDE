import { UserReference } from 'shared/models.model';

export class Reply {
    text: string;
    user: UserReference;
    created: Date;
    pendingApproval: boolean;
    status: string;
}

export class Comment {
    _id: string;
    text: string;
    user: UserReference;
    created: Date;
    pendingApproval: boolean;
    linkedTab: string;
    currentComment: boolean = false;
    status: string;
    currentlyReplying: boolean;
    replies: Reply[];
    element: {
        eltType: string,
        eltId: string
    } = {};
}