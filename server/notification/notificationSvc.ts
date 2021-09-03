import { ObjectId } from 'server';

export type NotificationType = 'comment';

export function typeToCriteria(type: NotificationType,
                               {org, users} = {org: undefined, users: []} as { org?: string, users: ObjectId[] }) {
    let result = {findNone: 1} as any;
    result = {
        $or: [
            {_id: {$in: users}},
            {orgAdmin: org},
            {orgCurator: org},
            {orgEditor: org}
        ]
    };
    return result;
}
