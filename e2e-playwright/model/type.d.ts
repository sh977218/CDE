import { CurationStatus } from 'shared/models.model';

export type ACCOUNT_KEYS =
    | 'nlm'
    | 'userExistingInUtsButNotCDE'
    | 'orgAdminUser'
    | 'orgAuthority'
    | 'nlmCurator'
    | 'ninds'
    | 'loginrecorduser'
    | 'regularUser'
    | 'ctepOnlyEditor'
    | 'acrin'
    | 'ctepEditor'
    | 'ctepAdmin'
    | 'cabigEditor'
    | 'testEditor'
    | 'formBoardUser'
    | 'nlmCuratorUser'
    | 'nlmEditorUser'
    | 'nlmAdminUser'
    | 'classificationManageUser'
    | 'workingGroupUser'
    | 'longUsernameUser'
    | 'pinuser'
    | 'unpinUser'
    | 'viewingHistoryUser'
    | 'boardExportUser'
    | 'formLinkedFormsUser'
    | 'classifyBoardUser'
    | 'tagBoardUser'
    | 'pinAllBoardUser'
    | 'doublepinuser'
    | 'boarduserEdit'
    | 'boardBot'
    | 'boarduser'
    | 'boarduser1'
    | 'boarduser2'
    | 'testuser'
    | 'governanceUser'
    | 'transferStewardUser';

export type ReorderDirection = 'Move up' | 'Move down' | 'Move to top' | 'Move to bottom';

export type ConceptType = 'Object Class' | 'Property' | 'Data Element Concept';
export type Module = 'cde' | 'form';
type BoardType = 'CDEs' | 'Forms';
export type TableViewSetting = {
    otherName?: boolean;
    usedBy?: boolean;
    updated?: boolean;
    permissibleValues?: boolean;
    numberOfPermissibleValues?: boolean;
    unitOfMeasure?: boolean;
    source?: boolean;
    nlmId?: boolean;
    steward?: boolean;
    linkedForms?: boolean;
    registrationStatus?: boolean;
    adminStatus?: boolean;
    questionTexts?: boolean;
    identifiers?: string[];
};
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
    public?: boolean;
    tags?: string[];
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
    sources: string[];
};

export type Definition = {
    definition: string;
    tags: string[];
    sources: string[];
};

export const enum DATATYPE {
    TEXT = 'Text',
    NUMBER = 'Number',
    DATE = 'Date',
    DYNAMIC_CODE_LIST = 'Dynamic Code List',
}

type DataTypeBase = {
    datatype: `${DATATYPE}`;
};

export const enum PRECISION {
    YEAR = 'Year',
    MONTH = 'Month',
    DAY = 'Day',
    HOUR = 'Hour',
    MINUTE = 'Minute',
    SECOND = 'Second',
}

export type DataTypeText = DataTypeBase & {
    maximalLength: number;
    minimalLength: number;
    datatypeTextRegex: string;
    datatypeTextRule: string;
};

export type DataTypeNumber = DataTypeBase & {
    minValue: number;
    maxValue: number;
    precision: string;
    uom: string;
};

export type DataTypeDate = DataTypeBase & {
    precision: `${PRECISION}`;
};

export type DataTypeDynamicCodeList = DataTypeBase & {
    system: string;
    code: string;
};

export type DataType = DataTypeText | DataTypeNumber | DataTypeDate | DataTypeDynamicCodeList;

export type Concept = {
    conceptName: string;
    conceptId: string;
    conceptSource?: string;
    conceptType: ConceptType;
};

export type Identifier = {
    source: string;
    id: string;
    version?: string;
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

export type RelatedDocument = {
    id: string;
    title: string;
    docType: string;
    uri: string;
    providerOrg: string;
    languageCode: string;
    document: string;
};

export type Property = {
    key: string;
    value: string;
    html?: boolean;
};

export type AlertType = 'Data Element saved.' | 'Form saved.';

export type RegistrationStatus = {
    status: CurationStatus;
    effectiveDate?: string;
    untilDate?: string;
    administrativeStatus?: string;
    administrativeNote?: string;
    unresolvedIssue?: string;
};

export type PermissibleValue = {
    permissibleValue?: string;
    valueMeaningDefinition?: string;
    conceptId?: string;
    conceptSource?: string;
    valueMeaningCode?: string;
    codeSystemName?: string;
};

export type Organization = {
    orgName: string;
    orgLongName?: string;
    orgMailAddress?: string;
    orgEmailAddress?: string;
    orgPhoneNumber?: string;
    orgUri?: string;
    orgWorkingGroup?: string;
    orgExtraInfo?: string;
};
