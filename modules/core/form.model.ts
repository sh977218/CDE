import {
    CdeId,
    Classification,
    DataSource,
    Elt,
    Instruction,
    Naming,
    ObjectId,
    PermissibleValue,
    DerivationRule,
    Property,
    ReferenceDocument,
    RegistrationState, UserReference
} from 'core/models.model';

export class CdeForm extends Elt {
    archived: boolean = false;
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
    numQuestions: number; // calculated, Elastic
    origin: string;
    properties: Property[];
    referenceDocuments: ReferenceDocument[];
    registrationState: RegistrationState;
    stewardOrg: {
        name: string,
    };
    source: string;
    sources: DataSource;
    updated: Date;
    updatedBy: UserReference;
    version: string;

    getEltUrl() {
        return '/formView?tinyId=' + this.tinyId;
    }

    getLabel() {
        return this.naming[0].designation;
    }
}

export class DisplayProfile {

    constructor(name: string) {
        this.name = name;
    }

    _id: ObjectId = null;
    displayCopyright: boolean = true;
    displayInstructions: boolean = true;
    displayInvisible: boolean = false;
    displayNumbering: boolean = true;
    displayType: string = 'Follow-up';
    displayValues: boolean = false;
    name: String;
    numberOfColumns: number = 4;
    repeatFormat: string = '#.';
    sectionsAsMatrix: boolean = true;
}

export interface FormElement {
    _id: ObjectId;
    readonly elementType: string;
    formElements: FormElement[];
    instructions: Instruction;
    label: string;
    repeat: string;
    skipLogic: SkipLogic;
}

export class FormSection implements FormElement {
    _id: ObjectId;
    edit: boolean = false;
    elementType = 'section';
    expanded = true; // Calculated, used for View TreeComponent
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
    _id: ObjectId;
    elementType = 'form';
    formElements = [];
    instructions: Instruction;
    inForm: InForm;
    label = "";
    repeat: string;
    skipLogic = new SkipLogic;
}

export class FormQuestion implements FormElement {
    _id: ObjectId;
    newCde: boolean = false;
    elementType = 'question';
    edit: boolean = false;
    formElements = [];
    hideLabel: boolean = false;
    incompleteRule: boolean = false;
    instructions: Instruction;
    label = "";
    question: Question = new Question;
    questionId: string;
    repeat: string;
    skipLogic = new SkipLogic;
}

export class Question {
    answer: any; // input value
    answerUom: string; // input uom value
    answerDate: any; // working storage for date part
    answerTime: any; // working storage for time part
    answers: PermissibleValue[];
    cde: QuestionCde = new QuestionCde;
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
    partOf: string; // display "(part of ...)" in Form Description
    required: boolean = false;
    uoms: string[];
}

export class SkipLogic {
    action: string;
    condition: string;
}

class Section {
}

class InForm {
    form: {
        name: string
        tinyId: string,
        version: string,
    };
}

export class QuestionCde {
    ids: CdeId[];
    name: string;
    permissibleValues: PermissibleValue[];
    outdated: boolean = false;
    tinyId: string;
    version: string;
    derivationRules: DerivationRule[];
}

class TextQuestion {
    minLength: number;
    maxLength: number;
    regex: string;
    rule: string;
    showAsTextArea: boolean = false;
}
