export class Comment {
    text: string;
    user: string;
    username: string;
    created: Date;
    pendingApproval: boolean;
    linkedTab: string;
    status: string;
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