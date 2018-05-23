import {
    CdeId,
    CodeAndSystem,
    Elt,
    FormattedValue,
    Instruction,
    ObjectId,
    PermissibleValue,
    DerivationRule,
    copyArray,
} from 'shared/models.model';
import {
    DatatypeContainer,
    QuestionTypeDate,
    QuestionTypeNumber,
    QuestionTypeText,
} from 'shared/de/dataElement.model';
import { iterateFeSync } from 'shared/form/formShared';

export class CdeForm extends Elt implements FormElementsContainer {
    copyright: { // mutable
        authority: string,
        text: string,
    };
    displayProfiles: DisplayProfile[] = []; // mutable
    elementType: string = 'form';
    formInput: any; // volatile, nativeRender and export
    formElements: FormElement[] = []; // mutable
    isCopyrighted: boolean;
    noRenderAllowed: boolean;
    numQuestions: number; // volatile, Elastic
    outdated: boolean; // volatile, server calculated

    constructor(elt: CdeForm = undefined) {
        super(elt);
        if (!elt) return;

        // immutable
        this.formInput = elt.formInput;
        this.isCopyrighted = elt.isCopyrighted;
        this.noRenderAllowed = elt.noRenderAllowed;
        this.numQuestions = elt.numQuestions;
        this.outdated = elt.outdated;

        // mutable
        this.copyright = {
            authority: elt.copyright ? elt.copyright.authority : '',
            text: elt.copyright ? elt.copyright.text : ''
        };
        copyArray(elt.displayProfiles, this.displayProfiles, DisplayProfile);
        copyArray(elt.formElements, this.formElements, FormSection);
    }

    static copy(elt: CdeForm) {
        return new CdeForm(elt);
    }

    getEltUrl() {
        return '/formView?tinyId=' + this.tinyId;
    }

    static validate(elt: CdeForm) {
        elt.displayProfiles.forEach(dp => {
            if (!dp.metadata) dp.metadata = {};
            if (!dp.unitsOfMeasureAlias) dp.unitsOfMeasureAlias = [];
        });
        function feValid(fe: FormElement) {
            if (!Array.isArray(fe.formElements)) fe.formElements = [];
            if (!fe.instructions) fe.instructions = new FormattedValue();
            if (!fe.skipLogic) fe.skipLogic = new SkipLogic();
        }
        iterateFeSync(elt,
            form => {
                feValid(form);
                if (!form.inForm) {
                    form.inForm = new InForm(); // or delete subForm
                }
            },
            section => {
                feValid(section);
                // if (!section.section) {
                //     section.section = new Section();
                // }
            },
            q => {
                feValid(q);
                if (!q.question) q.question = new Question();
                if (!Array.isArray(q.question.answers)) q.question.answers = [];
                if (!Array.isArray(q.question.unitsOfMeasure)) q.question.unitsOfMeasure = [];
                if (!q.question.cde) q.question.cde = new QuestionCde();
                if (!Array.isArray(q.question.cde.permissibleValues)) q.question.cde.permissibleValues = [];
                if (!Array.isArray(q.question.cde.derivationRules)) q.question.cde.derivationRules = [];
                if (!q.question.datatypeDate) q.question.datatypeDate = new QuestionTypeDate();
                if (!q.question.datatypeNumber) q.question.datatypeNumber = new QuestionTypeNumber();
                if (!q.question.datatypeText) q.question.datatypeText = new QuestionTypeText();
                if (!Array.isArray(q.question.uomsAlias)) q.question.uomsAlias = [];
                if (!Array.isArray(q.question.uomsValid)) q.question.uomsValid = [];
            }
        );
    }
}

export class CdeFormElastic extends CdeForm {
    constructor(elt: CdeFormElastic = undefined) {
        super(elt);
        if (!elt) return;
    }
    static copy(elt: CdeFormElastic) {
        return CdeForm.copy(elt);
    }
}

export class DisplayProfile {
    _id: ObjectId = null;
    answerDropdownLimit: number = 10;
    displayCopyright: boolean = true;
    displayInstructions: boolean = true;
    displayInvisible: boolean = false;
    displayNumbering: boolean = true;
    displayType: string = 'Follow-up';
    displayValues: boolean = false;
    metadata: {device?: boolean} = {};
    name: String;
    numberOfColumns: number = 4;
    repeatFormat: string = '#.';
    sectionsAsMatrix: boolean = true;
    unitsOfMeasureAlias: {alias: string, unitOfMeasure: CodeAndSystem}[] = [];

    constructor(name: string = '') {
        this.name = name;
    }

    static copy(profile: DisplayProfile) {
        let newProfile = Object.assign(new DisplayProfile(), profile);
        if (Array.isArray(profile.unitsOfMeasureAlias)) {
            newProfile.unitsOfMeasureAlias = [];
            profile.unitsOfMeasureAlias.forEach(u => newProfile.unitsOfMeasureAlias.push(
                {alias: u.alias, unitOfMeasure: CodeAndSystem.copy(u.unitOfMeasure)}));
        }
        return newProfile;
    }
}

export class FhirApp {
    clientId: string = '';
    dataEndpointUrl: string = '';
    forms: {tinyId: string}[] = [];
}

export interface FormElementsContainer {
    formElements: FormElement[];
}

export interface FormElement extends FormElementsContainer {
    _id: ObjectId;
    readonly elementType: string;
    expanded; // calculated, formDescription view model
    feId?: string; // calculated, nativeRender and formView view model
    formElements: FormElement[];
    instructions: Instruction;
    label: string;
    metadataTags?: {key: string, value?: any}[]; // calculated, used by FHIR
    repeat: string;
    skipLogic: SkipLogic;
    updatedSkipLogic: boolean; // calculated, formDescription view model
}

export interface FormSectionOrForm extends FormElement {
    forbidMatrix: boolean; // Calculated, used for Follow View Model
}

export class FormSection implements FormSectionOrForm {
    _id;
    edit: boolean; // calculated, formDescription view model
    elementType = 'section';
    expanded = true; // calculated, formDescription view model
    feId?: string; // calculated, nativeRender and formView view model
    forbidMatrix; // calculated, nativeRender view model
    formElements = [];
    hover: boolean; // calculated, formDescription view model
    instructions;
    label = '';
    metadataTags;
    repeat;
    repeatNumber: number; // calculated, formDescription view model
    repeatOption: string; // calculated, formDescription view model
    section: Section;
    skipLogic = new SkipLogic();
    updatedSkipLogic; // calculated, formDescription view model

    static copy(fe: FormElement) {
        let newFe;
        if (fe.elementType === 'section') {
            newFe = Object.assign(new FormSection(), fe);
            if ((fe as FormSection).section) {
                newFe.section = Section.copy((fe as FormSection).section);
            }
        } else if (fe.elementType === 'form') {
            newFe = Object.assign(new FormInForm(), fe);
            if ((fe as FormInForm).inForm) {
                newFe.inForm = InForm.copy((fe as FormInForm).inForm);
            }
        } else if (fe.elementType === 'question') {
            newFe = Object.assign(new FormQuestion(), fe);
            if ((fe as FormQuestion).question) {
                newFe.question = Question.copy((fe as FormQuestion).question);
            }
        } else {
            return;
        }
        newFe.instructions = fe.instructions ? Object.assign(new FormattedValue(), fe.instructions) : undefined;
        newFe.formElements = [];
        if (Array.isArray(fe.formElements)) {
            fe.formElements.forEach((f, i) => {
                newFe.formElements[i] = FormSection.copy(f);
            });
        }
        newFe.skipLogic = Object.assign(new SkipLogic(), fe.skipLogic);
        return newFe;
    }
}

export class FormInForm implements FormSectionOrForm {
    _id;
    edit: boolean; // calculated, formDescription view model
    elementType = 'form';
    expanded = false; // calculated, formDescription view model
    feId?: string; // calculated, nativeRender and formView view model
    forbidMatrix; // calculated, nativeRender view model
    formElements = [];
    hover: boolean; // calculated, formDescription view model
    instructions;
    inForm: InForm;
    label = '';
    metadataTags;
    repeat;
    repeatNumber: number; // calculated, formDescription view model
    repeatOption: string; // calculated, formDescription view model
    skipLogic = new SkipLogic();
    updatedSkipLogic; // calculated, formDescription view model
}

export class FormQuestion implements FormElement {
    _id;
    edit: boolean = false; // calculated, formDescription view model
    elementType = 'question';
    expanded = true; // calculated, formDescription view model
    feId?: string; // calculated, nativeRender and formView view model
    formElements = [];
    hideLabel: boolean; // calculated, formView view model
    hover: boolean = false; // calculated, formDescription view model
    incompleteRule: boolean;
    instructions;
    label = '';
    metadataTags;
    question: Question = new Question();
    repeat;
    skipLogic = new SkipLogic();
    updatedSkipLogic; // calculated, formDescription view model

    static datePrecisionToType = {
        Year: 'Number',
        Month: 'month',
        Day: 'date',
        Hour: 'datetime-local',
        Minute: 'datetime-local',
        Second: 'datetime-local'
    };
    static datePrecisionToStep = {
        Year: null,
        Month: null,
        Day: null,
        Hour: 3600,
        Minute: null,
        Second: 1
    };
}

class InForm {
    form: {
        name: string
        outdated: boolean; // calculated, by server for client
        tinyId: string,
        version: string,
    } = {name: '', outdated: false, tinyId: '', version: ''};

    static copy(inForm: Section) {
        return Object.assign(new InForm(), inForm ? JSON.parse(JSON.stringify(inForm)) : undefined);
    }
}

export class PermissibleFormValue extends PermissibleValue implements FormElementsContainer { // view model
    formElements: FormElement[]; // volatile, nativeRender
    index: number;
    nonValuelist: boolean;

    static copy(pv: PermissibleFormValue) {
        return Object.assign(new PermissibleFormValue(), pv);
    }
}

export class Question extends DatatypeContainer {
    answer: any; // volatile, input value
    answerUom: CodeAndSystem; // volatile, input uom value
    answerDate: any; // volatile, working storage for date part
    answerTime: any; // volatile, working storage for time part
    answers: PermissibleFormValue[] = []; // mutable
    cde: QuestionCde = new QuestionCde();
    defaultAnswer: string; // all datatypes, defaulted by areDerivationRulesSatisfied
    editable: boolean = true;
    invisible: boolean;
    isScore: boolean;
    multiselect: boolean;
    partOf: string; // volatile, display "(part of ...)" in Form Description
    required: boolean;
    unitsOfMeasure: CodeAndSystem[] = [];
    uomsAlias: string[] = []; // volatile, NativeRenderService
    uomsValid: string[] = []; // volatile, FormDescription

    static copy(question: Question) {
        let newQuestion = Object.assign(new Question(), question);
        super.copy(newQuestion, question);

        // immutable
        if (Array.isArray(newQuestion.unitsOfMeasure)) {
            newQuestion.unitsOfMeasure.forEach((u, i, a) => a[i] = CodeAndSystem.copy(u));
        }

        // mutable
        newQuestion.answers = [];
        copyArray(question.answers, newQuestion.answers, PermissibleFormValue);

        // skip client variables

        return newQuestion;
    }
}

export class QuestionCde { // copied from original data element, not configurable
    ids: CdeId[] = [];
    name: string;
    naming = [];
    designations = [];
    definitions = [];
    datatype = 'Text';
    permissibleValues: PermissibleValue[] = [];
    outdated: boolean = false; // calculated, by server for client
    tinyId: string;
    version: string;
    derivationRules: DerivationRule[] = [];

    static copy(a: QuestionCde|any) {
        if (a instanceof QuestionCde) {
            return a;
        } else {
            return Object.assign(new QuestionCde(), a);
        }
    }
}

class Section {
    static copy(section: Section) {
        return Object.assign(new Section(), section);
    }
}

export class SkipLogic {
    action: string;
    condition: string;
    validationError: string;
}
