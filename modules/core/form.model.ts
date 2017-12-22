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

export class CdeForm extends Elt implements FormElementsContainer {
    archived: boolean = false;
    changeNote: string;
    classification: Classification[] = [];
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
    formElements: FormElement[] = [];
    history: ObjectId[];
    ids: CdeId[];
    imported: Date;
    isCopyrighted: boolean;
    isDraft: boolean; // calculated, formView
    lastMigrationScript: string;
    naming: Naming[] = [];
    noRenderAllowed: boolean;
    numQuestions: number; // calculated, Elastic
    origin: string;
    properties: Property[];
    referenceDocuments: ReferenceDocument[];
    registrationState: RegistrationState;
    stewardOrg: {
        name: string,
    } = {name};
    source: string;
    sources: DataSource;
    updated: Date;
    updatedBy: UserReference;
    version: string;

    constructor(label = undefined) {
        super();
        this.naming.push(new Naming());
        this.naming[0].designation = label;
        this.registrationState = new RegistrationState;
        this.registrationState.registrationStatus = 'Incomplete';
    }

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

export interface FormElementsContainer {
    formElements: FormElement[];
}

export interface FormElement extends FormElementsContainer {
    _id: ObjectId;
    readonly elementType: string;
    formElements: FormElement[];
    instructions: Instruction;
    label: string;
    repeat: string;
    skipLogic: SkipLogic;
    updatedSkipLogic: boolean; // calculated, formDescription
}

export interface FormSectionOrForm extends FormElement {
    forbidMatrix: boolean; // Calculated, used for Follow View Model
}

export class FormSection implements FormSectionOrForm {
    _id;
    edit: boolean;
    elementType = 'section';
    expanded = true; // Calculated, used for View TreeComponent
    forbidMatrix;
    formElements = [];
    instructions;
    label = '';
    repeat;
    repeatNumber: number;
    repeatOption: string;
    section: Section;
    skipLogic;
    updatedSkipLogic;
}

export class FormInForm implements FormSectionOrForm {
    _id;
    elementType = 'form';
    forbidMatrix;
    formElements = [];
    instructions;
    inForm: InForm;
    label = '';
    repeat;
    skipLogic;
    updatedSkipLogic;
}

export class FormQuestion implements FormElement {
    _id;
    elementType = 'question';
    edit: boolean = false;
    formElements = [];
    hideLabel: boolean;
    incompleteRule: boolean;
    instructions;
    label = '';
    question: Question = new Question();
    questionId: string;
    repeat;
    skipLogic;
    updatedSkipLogic;
}

class InForm {
    form: {
        name: string
        tinyId: string,
        version: string,
    };
}

export class PermissibleFormValue extends PermissibleValue implements FormElementsContainer {
    formElements: FormElement[];
    index: number;
    nonValuelist: boolean;
}

export class Question {
    answer: any; // input value
    answerUom: string; // input uom value
    answerDate: any; // working storage for date part
    answerTime: any; // working storage for time part
    answers: PermissibleFormValue[] = [];
    cde: QuestionCde = new QuestionCde();
    datatype: string;
    datatypeDate: QuestionTypeDate;
    datatypeNumber: QuestionTypeNumber;
    datatypeText: QuestionTypeText;
    defaultAnswer: string;
    editable: boolean = true;
    invisible: boolean;
    isScore: boolean;
    multiselect: boolean;
    partOf: string; // display "(part of ...)" in Form Description
    required: boolean;
    uoms: string[] = [];
}

class QuestionCde {
    ids: CdeId[] = [];
    name: string;
    permissibleValues: PermissibleValue[] = [];
    outdated: boolean = false;
    tinyId: string;
    version: string;
    derivationRules: DerivationRule[] = [];
}

class QuestionTypeDate {
    format: string;
}

class QuestionTypeNumber {
    minValue: number;
    maxValue: number;
    precision: number;
}

class QuestionTypeText {
    minLength: number;
    maxLength: number;
    regex: string;
    rule: string;
    showAsTextArea: boolean = false;
}

class Section {
}

export class SkipLogic {
    action: string;
    condition: string;
    validationError: string;
}
