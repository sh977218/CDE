export type Module = 'cde' | 'form';
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

type BoardType = 'CDEs' | 'Forms';

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

export type ConceptType = 'Object Class' | 'Property' | 'Data Element Concept';

export type Concept = {
    conceptName: string;
    conceptId: string;
    conceptSource?: string;
    conceptType: ConceptType;
};

export type ReorderDirection = 'Move up' | 'Move down' | 'Move to top' | 'Move to bottom';
