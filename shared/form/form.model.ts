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
import { iterateFeSync } from 'shared/form/formShared';
import { DataElement, DataElementElastic } from 'shared/de/dataElement.model';

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

    constructor(elt: CdeForm = undefined) {
        super(elt);
        if (!elt) return;

        // immutable
        this.formInput = elt.formInput;
        this.isCopyrighted = elt.isCopyrighted;
        this.noRenderAllowed = elt.noRenderAllowed;
        this.numQuestions = elt.numQuestions;

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

    getLabel() {
        return this.naming[0].designation;
    }

    static validate(elt: CdeForm) {
        elt.displayProfiles.forEach(dp => {
            if (!dp.unitsOfMeasureAlias)
                dp.unitsOfMeasureAlias = [];
        });
        iterateFeSync(elt,
            form => {
                if (!Array.isArray(form.formElements))
                    form.formElements = [];
            },
            section => {
                if (!Array.isArray(section.formElements))
                    section.formElements = [];
            },
            q => {
                if (!Array.isArray(q.formElements))
                    q.formElements = [];
                if (!Array.isArray(q.question.answers))
                    q.question.answers = [];
                if (!Array.isArray(q.question.unitsOfMeasure))
                    q.question.unitsOfMeasure = [];
                if (!Array.isArray(q.question.cde.permissibleValues))
                    q.question.cde.permissibleValues = [];
                if (!Array.isArray(q.question.cde.derivationRules))
                    q.question.cde.derivationRules = [];
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

export interface FormElementsContainer {
    formElements: FormElement[];
}

export interface FormElement extends FormElementsContainer {
    _id: ObjectId;
    descriptionId: string;
    readonly elementType: string;
    expanded; // Calculated, used for View TreeComponent
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
    descriptionId: string;
    elementType = 'section';
    expanded = true; // Calculated, used for View TreeComponent
    forbidMatrix;
    formElements = [];
    hover: boolean;
    instructions;
    label = '';
    repeat;
    repeatNumber: number;
    repeatOption: string;
    section: Section;
    skipLogic;
    updatedSkipLogic;

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
            return undefined;
        }
        newFe.instructions = Object.assign(new FormattedValue(), fe.instructions);
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
    descriptionId: string;
    elementType = 'form';
    expanded = true; // Calculated, used for View TreeComponent
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
    constructor(_newCde?: boolean, _edit?: boolean) {
        this.newCde = _newCde;
        this.edit = _edit;
    }
    _id;
    descriptionId: string;
    edit: boolean = false;
    elementType = 'question';
    expanded = true; // Calculated, used for View TreeComponent
    hover: boolean = false;
    formElements = [];
    hideLabel: boolean;
    incompleteRule: boolean;
    instructions;
    label = '';
    newCde: boolean = false;
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

    static copy(inForm: Section) {
        return Object.assign(new InForm(), inForm ? JSON.parse(JSON.stringify(inForm)) : undefined);
    }
}

export class PermissibleFormValue extends PermissibleValue implements FormElementsContainer {
    formElements: FormElement[]; // volatile, nativeRender
    index: number;
    nonValuelist: boolean;

    static copy(pv: PermissibleFormValue) {
        return Object.assign(new PermissibleFormValue(), pv);
    }
}

export class Question {
    answer: any; // volatile, input value
    answerUom: CodeAndSystem; // volatile, input uom value
    answerDate: any; // volatile, working storage for date part
    answerTime: any; // volatile, working storage for time part
    answers: PermissibleFormValue[] = []; // mutable
    cde: QuestionCde = new QuestionCde();
    datatype: string;
    datatypeDate: QuestionTypeDate; // mutable
    datatypeNumber: QuestionTypeNumber; // mutable
    datatypeText: QuestionTypeText; // mutable
    defaultAnswer: string;
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

        // immutable
        if (Array.isArray(newQuestion.unitsOfMeasure)) {
            newQuestion.unitsOfMeasure.forEach((u, i, a) => a[i] = CodeAndSystem.copy(u));
        }

        // mutable
        newQuestion.answers = [];
        copyArray(question.answers, newQuestion.answers, PermissibleFormValue);
        newQuestion.datatypeDate = QuestionTypeDate.copy(question.datatypeDate);
        newQuestion.datatypeNumber = QuestionTypeNumber.copy(question.datatypeNumber);
        newQuestion.datatypeText = QuestionTypeText.copy(question.datatypeText);

        // skip client variables

        return newQuestion;
    }
}

export class QuestionCde {
    ids: CdeId[] = [];
    name: string;
    naming = [];
    datatype = 'Text';
    permissibleValues: PermissibleValue[] = [];
    outdated: boolean = false;
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

class QuestionTypeDate {
    format: string;

    static copy(q: QuestionTypeDate) {
        return Object.assign(new QuestionTypeDate(), q);
    }
}

class QuestionTypeNumber {
    minValue: number;
    maxValue: number;
    precision: number;

    static copy(q: QuestionTypeNumber) {
        return Object.assign(new QuestionTypeNumber(), q);
    }
}

class QuestionTypeText {
    minLength: number;
    maxLength: number;
    regex: string;
    rule: string;
    showAsTextArea: boolean = false;

    static copy(q: QuestionTypeText) {
        return Object.assign(new QuestionTypeText(), q);
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
