import {
    CdeId,
    CodeAndSystem, Definition,
    DerivationRule, Designation,
    Elt,
    EltRef,
    FormattedValue,
    Instruction,
    ObjectId,
    PermissibleValue,
} from 'shared/models.model';
import {
    DatatypeContainerDate, DatatypeContainerDynamicList, DatatypeContainerExternal,
    DatatypeContainerFile, DatatypeContainerGeo, DatatypeContainerNumber, DatatypeContainerText, DatatypeContainerTime,
    DatatypeContainerValueList, ElasticElement,
    QuestionTypeDate,
    QuestionTypeNumber,
    QuestionTypeText,
} from 'shared/de/dataElement.model';
import { iterateFeSync } from 'shared/form/fe';

export type QuestionValue = any;

export class CdeForm<T extends FormElement = FormElement> extends Elt implements FormElementsContainer {
    copyright?: { // mutable
        authority?: string,
        text?: string,
        urls: CopyrightURL[]
    };
    displayProfiles: DisplayProfile[] = []; // mutable
    elementType: 'form' = 'form';
    expanded?: boolean; // calculated, formDescription view model
    formElements: T[] = []; // mutable
    isBundle: boolean = false; // mutable, protected
    isCopied?: 'copied' | 'clear'; // volatile, form description
    isCopyrighted?: boolean;
    noRenderAllowed?: boolean;
    outdated?: boolean; // volatile, server calculated

    static getEltUrl(elt: Elt) {
        return '/formView?tinyId=' + elt.tinyId;
    }

    static validate(elt: CdeForm) {
        Elt.validate(elt);

        if (elt.isCopyrighted && !elt.copyright) {
            elt.copyright = {
                urls: []
            };
        }

        elt.displayProfiles.forEach(dp => {
            if (!dp.metadata) {
                dp.metadata = {};
            }
            if (!dp.unitsOfMeasureAlias) {
                dp.unitsOfMeasureAlias = [];
            }
        });

        function feValid(fe: FormElement) {
            if (!Array.isArray(fe.formElements)) {
                fe.formElements = [];
            }
            if (!fe.instructions) {
                fe.instructions = new FormattedValue();
            }
            if (!fe.skipLogic) {
                fe.skipLogic = new SkipLogic();
            }
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
            (q: FormQuestion) => {
                feValid(q);
                if (!q.question) {
                    q.question = question() as Question;
                }
                if (!Array.isArray(q.question.unitsOfMeasure)) {
                    q.question.unitsOfMeasure = [];
                }
                if (!q.question.cde) {
                    q.question.cde = new QuestionCde();
                }
                if (!Array.isArray(q.question.cde.derivationRules)) {
                    q.question.cde.derivationRules = [];
                }
                if (!Array.isArray(q.question.uomsAlias)) {
                    q.question.uomsAlias = [];
                }
                if (!Array.isArray(q.question.uomsValid)) {
                    q.question.uomsValid = [];
                }
                switch (q.question.datatype) {
                    case 'Value List':
                        if (!Array.isArray(q.question.answers)) {
                            q.question.answers = [];
                        }
                        if (!Array.isArray(q.question.cde.permissibleValues)) {
                            q.question.cde.permissibleValues = [];
                        }
                        if (!displayAsValueListList.includes(q.question.displayAs)) {
                            q.question.displayAs = 'radio/checkbox/select';
                        }
                        break;
                    case 'Date':
                        if (!q.question.datatypeDate) {
                            q.question.datatypeDate = new QuestionTypeDate();
                        }
                        break;
                    case 'Number':
                        if (!q.question.datatypeNumber) {
                            q.question.datatypeNumber = new QuestionTypeNumber();
                        }
                        break;
                    case 'Text':
                        if (!q.question.datatypeText) {
                            q.question.datatypeText = new QuestionTypeText();
                        }
                        break;
                    case 'Dynamic Code List':
                    case 'Externally Defined':
                    case 'File':
                    case 'Geo Location':
                    case 'Time':
                        break;
                    default:
                        // treat as Text
                        const questionText = q.question as QuestionText;
                        questionText.datatype = 'Text';
                        if (!questionText.datatypeText) {
                            questionText.datatypeText = new QuestionTypeText();
                        }
                }
            }
        );
    }
}

export type CdeFormDraft = CdeForm<FormElementDraft>;
export type CdeFormFollow = CdeForm<FormElementFollow>;

export type CdeFormInputArray = CdeForm & {
    formInput: { [key: string]: QuestionValue }; // volatile, nativeRender and export
};

export interface CdeFormElastic extends CdeForm, ElasticElement { // all volatile
    // [key: string]: any; // used for highlighting
    cdeTinyIds: string[];
    numQuestions?: number;
}

export class CopyrightURL {
    url = '';
    valid = false;
}


export class DisplayProfile {
    _id!: ObjectId; // TODO: remove
    answerDropdownLimit = 10;
    displayCopyright = true;
    displayInstructions = true;
    displayInvisible = false;
    displayNumbering = true;
    displayType: DisplayType = 'Follow-up';
    displayValues = false;
    metadata: { device?: boolean } = {};
    name: string;
    numberOfColumns = 4;
    repeatFormat = '#.';
    sectionsAsMatrix = true;
    unitsOfMeasureAlias: { alias: string, unitOfMeasure: CodeAndSystem }[] = [];

    constructor(name = '') {
        this.name = name;
    }
}

export type DisplayType = 'Follow-up' | 'Dynamic';

class EltRefCaching extends EltRef {
    ids!: CdeId[];
}

export class ExternalMappings {
    [system: string]: any;
}

export interface FormElementsContainer<T extends FormElement = FormElement> {
    formElements: T[];
}

class FormElementEdit<T extends FormElement> implements FormElementsContainer<T> {
    edit?: boolean; // calculated, formDescription view model
    expanded?: boolean; // calculated, formDescription view model
    formElements: T[] = [];
    hover?: boolean; // calculated, formDescription view model
    repeatNumber?: number; // calculated, formDescription view model
    repeatOption?: string; // calculated, formDescription view model
    repeatQuestion?: string; // calculated, formDescription view model
    updatedSkipLogic?: boolean; // calculated, formDescription view model
}

export class FormElementPart<T extends FormElement> extends FormElementEdit<T> implements FormElementsContainer<T> {
    // TODO: private after mixins for nativeSectionMatrix is resolved
    _id?: ObjectId; // TODO: remove
    feId?: string; // calculated, nativeRender and formView view model
    instructions?: Instruction;
    label?: string = '';
    metadataTags?: MetadataTag[]; // calculated, used by native
    repeat?: string;
    skipLogic?: SkipLogic = new SkipLogic();
}

class FormSectionOrFormPart<T extends FormElement> extends FormElementPart<T> {
    forbidMatrix?: boolean; // Calculated, used for Follow View Model
    isCopied?: 'copied' | 'clear'; // volatile, form description
}

export class FormSection<T extends FormElement = FormElement> extends FormSectionOrFormPart<T> {
    readonly elementType: 'section' = 'section';
    section = new Section();

    constructor() {
        super();
        this.expanded = true;
    }
}

export class FormInForm<T extends FormElement = FormElement> extends FormSectionOrFormPart<T> {
    readonly elementType: 'form' = 'form';
    inForm = new InForm();

    constructor() {
        super();
        this.expanded = false;
    }
}

export class FormQuestion<T extends FormElement = FormElement> extends FormElementPart<T> {
    readonly elementType: 'question' = 'question';
    incompleteRule?: boolean; // volatile, form description
    question: Question = question() as Question;

    constructor() {
        super();
        this.expanded = true;
    }

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

export type FormQuestionDraft = FormQuestion<FormElementDraft> & {
    question: {
        cde: {
            newCde?: {
                definitions: Definition[],
                designations: Designation[],
            }
        }
    }
};

export type FormQuestionFollow = FormQuestion<FormElementFollow> & {
    question: QuestionFollow;
};
export type FormSectionOrForm = FormInForm | FormSection;
export type FormSectionOrFormFollow = FormInForm<FormElementFollow> | FormSection<FormElementFollow>;
export type FormElement = FormInForm | FormSection | FormQuestion;
export type FormElementGeneric<T extends FormElement> = FormInForm<T> | FormSection<T> | FormQuestion<T>;
export type FormElementDraft = FormInForm<FormElementDraft> | FormSection<FormElementDraft> | FormQuestionDraft;
export type FormElementFollow = FormInForm<FormElementFollow> | FormSection<FormElementFollow> | FormQuestionFollow;
export type FormOrElement = CdeForm | FormElement;
export type FormOrElementFollow = CdeFormFollow | FormElementFollow;

class InForm {
    form!: EltRefCaching;
}

export class MetadataTag {
    key: string;
    value?: any;

    constructor(key: string) {
        this.key = key;
    }
}

export class PermissibleFormValue extends PermissibleValue implements FormElementsContainer<FormElementFollow> { // view model
    formElements!: FormElementFollow[]; // volatile, nativeRender
    index?: number;
    nonValuelist?: boolean;
}

export type Question = QuestionDate
    | QuestionDynamicList
    | QuestionExternal
    | QuestionFile
    | QuestionGeo
    | QuestionNumber
    | QuestionText
    | QuestionTime
    | QuestionValueList;

export type QuestionFollow = Question & {
    answers?: PermissibleFormValue[]; // mutable
    cde?: QuestionCdeValueList;
    multiselect?: boolean;
};

interface QuestionPart {
    answer?: QuestionValue; // volatile, input value
    answerVM?: any[]; // volatile, input value for select
    answerUom?: CodeAndSystem; // volatile, input uom value
    cde: QuestionCde;
    defaultAnswer?: string; // all datatypes, defaulted by areDerivationRulesSatisfied
    editable?: boolean;
    invisible?: boolean;
    scoreFormula?: string; // volatile, form description
    scoreError?: string;
    partOf?: string; // volatile, display '(part of ...)' in Form Description
    required?: boolean;
    previousUom?: CodeAndSystem; // volatile, native render question renderer
    unitsOfMeasure: CodeAndSystem[];
    uomsAlias: string[]; // volatile, NativeRenderService
    uomsValid: string[]; // volatile, FormDescription
}

export type QuestionDate = DatatypeContainerDate & QuestionPart & {
    answerDate?: any; // volatile, working storage for date part
    answerTime?: any; // volatile, working storage for time part
};
export type QuestionDynamicList = DatatypeContainerDynamicList & QuestionPart;
export type QuestionExternal = DatatypeContainerExternal & QuestionPart;
export type QuestionFile = DatatypeContainerFile & QuestionPart;
export type QuestionGeo = DatatypeContainerGeo & QuestionPart;
export type QuestionNumber = DatatypeContainerNumber & QuestionPart;
export type QuestionText = DatatypeContainerText & QuestionPart;
export type QuestionTime = DatatypeContainerTime & QuestionPart;
export type QuestionValueList = DatatypeContainerValueList & QuestionPart & {
    answers: PermissibleValue[]; // mutable
    cde: QuestionCdeValueList;
    displayAs: displayAsValueList;
    multiselect?: boolean;
};

export type displayAsValueList = 'radio/checkbox/select' | 'likert scale';
export const displayAsValueListList = ['radio/checkbox/select', 'likert scale'];

export function question(): Partial<Question> {
    return {
        cde: new QuestionCde(),
        datatype: 'Text',
        editable: true,
        unitsOfMeasure: [],
        uomsAlias: [],
        uomsValid: []
    };
}

export class QuestionCde extends EltRefCaching {
    derivationRules: DerivationRule[] = []; // copied from original data element
}

export type QuestionCdeValueList = QuestionCde & {
    permissibleValues: PermissibleValue[];
};

class Section {
}

export class SkipLogic {
    action?: string;
    condition: string = '';
    validationError?: string;
}
