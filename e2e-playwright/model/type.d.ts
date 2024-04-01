export type ACCOUNT_KEYS =
    | 'nlm'
    | 'orgAuthority'
    | 'nlmCurator'
    | 'ninds'
    | 'loginrecorduser'
    | 'regularUser'
    | 'ctepOnlyEditor'
    | 'ctepEditor'
    | 'testEditor'
    | 'classifyBoardUser'
    | 'formBoardUser'
    | 'nlmCuratorUser'
    | 'nlmEditorUser'
    | 'nlmAdminUser'
    | 'classificationManageUser'
    | 'workingGroupUser'
    | 'longUsernameUser'
    | 'unpinUser'
    | 'viewingHistoryUser'
    | 'boardExportUser'
    | 'formLinkedFormsUser';

export type ReorderDirection = 'Move up' | 'Move down' | 'Move to top' | 'Move to bottom';
export type ConceptType = 'Object Class' | 'Property' | 'Data Element Concept';
export type Module = 'cde' | 'form';
type BoardType = 'CDEs' | 'Forms';

export type Account = {
    username: string;
    password: string;
};
export type DisplayProfile = {
    profileName: string;
    styleName: string;
    numberOfColumn: number;
    answerDropdownLimit: number;
    matrix: boolean;
    displayValues: boolean;
    instructions: boolean;
    numbering: boolean;
    displayInvisibleQuestion: boolean;
    displayMetadataDevice: boolean;
};

export type Board = {
    boardName: string;
    boardDefinition: string;
    type: BoardType;
};

export type Version = {
    newVersion: string;
    changeNote: string;
};

export type EditDesignationConfig = {
    replace: boolean;
};

export type EditDefinitionConfig = EditDesignationConfig & {
    html: boolean;
};

export type Designation = {
    designation: string;
    tags: string[];
};

export type Definition = {
    definition: string;
    tags: string[];
};

export type Concept = {
    conceptName: string;
    conceptId: string;
    conceptSource?: string;
    conceptType: ConceptType;
};

export type CreateElt = {
    eltName: string;
    eltDef: string;
    eltOrg: string;
    eltClassificationCategories: string[];
};

export type Copyright = {
    copyright?: boolean;
    statement?: string;
    authority?: string;
    url?: string;
};

export type Property = {
    key: string;
    value: string;
    html?: boolean;
};

export type AlertType = 'Data Element saved.' | 'Form saved.';

export type RegistrationStatusType =
    | 'Incomplete'
    | 'Recorded'
    | 'Candidate'
    | 'Qualified'
    | 'Standard'
    | 'Preferred Standard'
    | 'Retired';

export type RegistrationStatus = {
    status: RegistrationStatusType;
    effectiveDate?: string;
    untilDate?: string;
    administrativeStatus?: string;
    administrativeNote?: string;
    unresolvedIssue?: string;
};
