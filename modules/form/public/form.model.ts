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
} from 'core/public/models.model';

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
    unsaved: boolean = false;
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
    _id: ObjectId = null;
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
    elementType = 'question';
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
    answer: any; // input value
    answerDate: any; // working storage for date part
    answerTime: any; // working storage for time part
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

class Section {
}

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
    derivationRules: DerivationRule[];
}

class TextQuestion {
    minLength: number;
    maxLength: number;
    regex: string;
    rule: string;
    showAsTextArea: boolean = false;
}
