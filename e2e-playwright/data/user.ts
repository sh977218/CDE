import { Account, ACCOUNT_KEYS } from '../model/type';

const DEFAULT_PASSWORD = 'pass';

export const Accounts: Record<ACCOUNT_KEYS, Account> = {
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
    nlmAdminUser: {
        username: 'nlmAdmin',
        password: DEFAULT_PASSWORD,
    },
    nlmEditorUser: {
        username: 'nlmEditor',
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
    classifyBoardUser: {
        username: 'classifyBoardUser',
        password: DEFAULT_PASSWORD,
    },
    formBoardUser: {
        username: `formboarduser`,
        password: DEFAULT_PASSWORD,
    },
    nlmCuratorUser: {
        username: 'nlmCurator',
        password: DEFAULT_PASSWORD,
    },
    classificationManageUser: {
        username: 'classMgtUser',
        password: DEFAULT_PASSWORD,
    },
    workingGroupUser: {
        username: 'wguser',
        password: DEFAULT_PASSWORD,
    },
    longUsernameUser: {
        username: 'hiIamLongerThanSeventeenCharacters',
        password: DEFAULT_PASSWORD,
    },
    unpinUser: {
        username: 'unpinuser',
        password: DEFAULT_PASSWORD,
    },
    viewingHistoryUser: {
        username: 'viewHistoryUser',
        password: DEFAULT_PASSWORD,
    },
};
