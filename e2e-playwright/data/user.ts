import { Account } from '../model/type';

const DEFAULT_PASSWORD = 'pass';

export const Accounts: Record<string, Account> = {
    nlm: {
        username: 'nlm',
        password: 'nlm',
    },
    orgAuthority: {
        username: 'orgAuthorityUser',
        password: DEFAULT_PASSWORD,
    },
    nlmCurator: {
        username: 'nlmCurator',
        password: DEFAULT_PASSWORD,
    },
    ninds: {
        username: 'ninds',
        password: DEFAULT_PASSWORD,
    },
    loginrecorduser: {
        username: 'loginrecorduser',
        password: 'umls',
    },
    regularUser: {
        username: 'reguser',
        password: DEFAULT_PASSWORD,
    },
    ctepOnlyEditor: {
        username: 'ctepOnlyEditor',
        password: DEFAULT_PASSWORD,
    },
    ctepEditor: {
        username: 'ctepEditor',
        password: DEFAULT_PASSWORD,
    },
    testEditor: {
        username: 'testEditor',
        password: DEFAULT_PASSWORD,
    },
};
