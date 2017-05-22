export class Comment {
    _id: string;
    text: string;
    user: string;
    username: string;
    created: Date;
    pendingApproval: boolean;
    linkedTab: string;
    status: string;
    currentlyReplying: boolean;
    replies: [
        {
            text: string
            user: string
            username: string
            created: Date
            pendingApproval: boolean
            status: string
        }
    ];
    element: {
        eltType: string
        eltId: String
    };
}