import {
    Attachment,
    CdeId, Classification, DataSource, Instruction, Naming, ObjectId, PermissibleValue, Property, ReferenceDocument,
    RegistrationState, UserReference
} from "../../core/public/models.model";
import { ReferenceDocumentComponent } from "../../adminItem/public/components/referenceDocument.component";

export class CdeForm {
    archived: boolean = false;
    attachments: Attachment[];
    changeNote: string;
    classification: Classification[];
    comments: Comment[];
    copyright: {
        authority: string,
        text: string,
    };
    created: Date;
    createdBy: UserReference;
    displayProfiles: DisplayProfile[];
    elementType: string = 'form';
    formInput: any;
    formElements: FormElement[];
    history: ObjectId[];
    ids: CdeId[];
    imported: Date;
    isCopyrighted: boolean;
    lastMigrationScript: string;
    naming: Naming[];
    noRenderAllowed: boolean;
    origin: string;
    properties: Property[];
    referenceDocuments: ReferenceDocument[];
    registrationState: RegistrationState;
    stewardOrg: {
        name: string,
    };
    source: string;
    sources: DataSource;
    tinyId: string;
    unsaved: boolean = false;
    updated: Date;
    updatedBy: UserReference;
    version: string;
}

export class DisplayProfile {
    _id: boolean = false;
    displayInstructions: boolean;
    displayInvisible: boolean;
    displayNumbering: boolean;
    displayType: string = 'Dynamic';
    displayValues: boolean;
    name: String;
    numberOfColumns: number;
    repeatFormat: string = '';
    sectionsAsMatrix: boolean;
}

export interface FormElement {
    _id: boolean;
    readonly elementType: string;
    formElements: FormElement[];
    instructions: Instruction;
    label: string;
    repeat: string;
    skipLogic: SkipLogic;
}

export class FormSection implements FormElement {
    _id: boolean;
    edit: boolean = false;
    elementType = "section";
    instructions: Instruction;
    formElements = [];
    label = "";
    repeat: string;
    repeatNumber: number;
    repeatOption: string;
    section: Section;
    skipLogic = new SkipLogic;
}

export class FormInForm implements FormElement {
    _id: boolean;
    elementType = "form";
    formElements = [];
    instructions: Instruction;
    inForm: InForm;
    label = "";
    repeat: string;
    skipLogic = new SkipLogic;
}

export class FormQuestion implements FormElement {
    _id: boolean;
    elementType = "question";
    edit: boolean = false;
    formElements = [];
    hideLabel: boolean = false;
    incompleteRule: boolean = false;
    instructions: Instruction;
    label = "";
    question: Question;
    questionId: string;
    repeat: string;
    skipLogic = new SkipLogic;
}

export class Question {
    answers: PermissibleValue[];
    cde: QuestionCde;
    datatype: string;
    datatypeDate: {
        format: string,
    };
    datatypeNumber: {
        minValue: number,
        maxValue: number,
        precision: number,
    };
    datatypeText: TextQuestion;
    defaultAnswer: string;
    editable: boolean = true;
    invisible: boolean = false;
    isScore: boolean = false;
    multiselect: boolean;
    required: boolean = false;
    uoms: string[];
}

export class SkipLogic {
    action: string;
    condition: string;
}

class Section {}

class InForm {
    form: {
        name: string
        tinyId: string,
        version: string,
    };
}

class QuestionCde {
    ids: CdeId[];
    name: string;
    permissibleValues: PermissibleValue[];
    outdated: boolean = false;
    tinyId: string;
    version: string;
}

class TextQuestion {
    minLength: number;
    maxLength: number;
    regex: string;
    rule: string;
    showAsTextArea: boolean = false;
}
