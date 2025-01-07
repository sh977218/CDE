import { Account, ACCOUNT_KEYS } from '../model/type';

const DEFAULT_PASSWORD = 'pass';

export const Accounts: Record<ACCOUNT_KEYS, Account> = {
    nlm: {
        username: 'nlm',
        password: 'nlm',
    },
    // do not add this user to CDE mongo DB.
    userExistingInUtsButNotCDE: {
        username: 'userExistingInUtsButNotCDE',
        password: DEFAULT_PASSWORD,
    },
    orgAdminUser: {
        username: 'orgAdminUser',
        password: DEFAULT_PASSWORD,
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
        password: DEFAULT_PASSWORD,
    },
    regularUser: {
        username: 'reguser',
        password: DEFAULT_PASSWORD,
    },
    ctepOnlyEditor: {
        username: 'ctepOnlyEditor',
        password: DEFAULT_PASSWORD,
    },
    acrin: {
        username: 'acrin',
        password: DEFAULT_PASSWORD,
    },
    ctepEditor: {
        username: 'ctepEditor',
        password: DEFAULT_PASSWORD,
    },
    ctepAdmin: {
        username: 'ctepAdmin',
        password: DEFAULT_PASSWORD,
    },
    cabigEditor: {
        username: 'cabigEditor',
        password: DEFAULT_PASSWORD,
    },
    testEditor: {
        username: 'testEditor',
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
    pinuser: {
        username: 'pinuser',
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
    boardExportUser: {
        username: 'boardExportUser',
        password: DEFAULT_PASSWORD,
    },
    formLinkedFormsUser: {
        username: 'formLinkedFormsUser',
        password: DEFAULT_PASSWORD,
    },
    classifyBoardUser: {
        username: 'classifyBoardUser',
        password: DEFAULT_PASSWORD,
    },
    tagBoardUser: {
        username: 'tagBoardUser',
        password: DEFAULT_PASSWORD,
    },
    pinAllBoardUser: {
        username: 'pinAllBoardUser',
        password: DEFAULT_PASSWORD,
    },
    doublepinuser: {
        username: 'doublepinuser',
        password: DEFAULT_PASSWORD,
    },
    boarduserEdit: {
        username: 'boarduserEdit',
        password: DEFAULT_PASSWORD,
    },
    boardBot: {
        username: 'boardBot',
        password: DEFAULT_PASSWORD,
    },
    boarduser: {
        username: 'boarduser',
        password: DEFAULT_PASSWORD,
    },
    boarduser1: {
        username: 'boarduser1',
        password: DEFAULT_PASSWORD,
    },
    boarduser2: {
        username: 'boarduser2',
        password: DEFAULT_PASSWORD,
    },
    testuser: {
        username: 'testuser',
        password: DEFAULT_PASSWORD,
    },
    governanceUser: {
        username: 'governanceUser',
        password: DEFAULT_PASSWORD,
    },
};
