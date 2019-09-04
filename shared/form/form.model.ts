import {
    assertUnreachable,
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
    DataType,
    DatatypeContainer, DatatypeContainerDate, DatatypeContainerDynamicList, DatatypeContainerExternal,
    DatatypeContainerFile, DatatypeContainerGeo, DatatypeContainerNumber, DatatypeContainerText, DatatypeContainerTime,
    DatatypeContainerValueList,
    QuestionTypeDate,
    QuestionTypeNumber,
    QuestionTypeText,
} from 'shared/de/dataElement.model';
import { iterateFeSync } from 'shared/form/fe';
import { supportedFhirResources } from 'shared/mapping/fhir/fhirResource.model';

export type QuestionValue = any;

export class CdeForm extends Elt implements FormElementsContainer {
    copyright?: { // mutable
        authority?: string,
        text?: string,
    };
    displayProfiles: DisplayProfile[] = []; // mutable
    elementType: 'form' = 'form';
    expanded?: boolean; // calculated, formDescription view model
    formElements: FormElement[] = []; // mutable
    isCopied?: 'copied' | 'clear'; // volatile, form description
    isCopyrighted?: boolean;
    mapTo?: ExternalMappings; // calculated, used by: FHIR
    noRenderAllowed?: boolean;
    outdated?: boolean; // volatile, server calculated

    static getEltUrl(elt: Elt) {
        return '/formView?tinyId=' + elt.tinyId;
    }

    static validate(elt: CdeForm) {
        Elt.validate(elt);

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
                        throw assertUnreachable(q.question);
                }
            }
        );
    }
}

export type CdeFormFollow = CdeForm & FormElementsFollowContainer;

export type CdeFormInputArray = CdeForm & {
    formInput: {[key: string]: QuestionValue}; // volatile, nativeRender and export
};

export class CdeFormElastic extends CdeForm { // all volatile
    [key: string]: any; // used for highlighting
    flatClassifications?: string[];
    highlight?: any;
    numQuestions?: number;
    primaryDefinitionCopy?: string;
    primaryNameCopy!: string;
    primaryNameSuggest?: string;
    score!: number;
}

export class FhirProcedureMapping {
    [key: string]: any;

    statusQuestionID?: string;
    statusStatic?: string;
    performedDate?: string;
    procedureQuestionID?: string;
    procedureCode?: string;
    procedureCodeSystem?: string;
    bodySiteQuestionID?: string;
    bodySiteCode?: string;
    bodySiteCodeSystem?: string;
    usedReferences?: string;
    usedReferencesMaps?: string[];
    complications?: string;
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
    fhirProcedureMapping?: FhirProcedureMapping = {};

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
    fhir?: {
        resourceType?: supportedFhirResources,
    };
}

export class FhirApp {
    _id!: ObjectId;
    clientId = '';
    dataEndpointUrl = '';
    forms: { tinyId?: string }[] = [];
    mapping: { cdeSystem?: string, cdeCode?: string, fhirSystem?: string, fhirCode?: string }[] = [];
    timestamp?: Date;
}

export class FhirObservationInfo {
    _id?: string;
    categories?: string[];
    timestamp?: Date;
}

export interface FormElementsContainer<T = FormElement> {
    formElements: T[];
}

export type FormElementsFollowContainer = FormElementsContainer & {
    formElements: FormElementFollow[];
};

class FormElementEdit implements FormElementsContainer {
    edit?: boolean; // calculated, formDescription view model
    expanded?: boolean; // calculated, formDescription view model
    formElements: FormElement[] = [];
    hover?: boolean; // calculated, formDescription view model
    repeatNumber?: number; // calculated, formDescription view model
    repeatOption?: string; // calculated, formDescription view model
    repeatQuestion?: string; // calculated, formDescription view model
    updatedSkipLogic?: boolean; // calculated, formDescription view model
}

export class FormElementPart extends FormElementEdit implements FormElementsContainer {
    // TODO: private after mixins for nativeSectionMatrix is resolved
    _id?: ObjectId; // TODO: remove
    feId?: string; // calculated, nativeRender and formView view model
    instructions?: Instruction;
    label?: string = '';
    mapTo?: ExternalMappings; // calculated, used by: FHIR
    metadataTags?: MetadataTag[]; // calculated, used by FHIR
    repeat?: string;
    skipLogic?: SkipLogic = new SkipLogic();
}

class FormSectionOrFormPart extends FormElementPart {
    forbidMatrix?: boolean; // Calculated, used for Follow View Model
    isCopied?: 'copied' | 'clear'; // volatile, form description
}

export class FormSection extends FormSectionOrFormPart {
    readonly elementType: 'section' = 'section';
    section = new Section();

    constructor() {
        super();
        this.expanded = true;
    }
}

export type FormSectionFollow = FormSection & FormElementsFollowContainer;

export class FormInForm extends FormSectionOrFormPart {
    readonly elementType: 'form' = 'form';
    inForm = new InForm();

    constructor() {
        super();
        this.expanded = false;
    }
}

export type FormInFormFollow = FormInForm & FormElementsFollowContainer;

export class FormQuestion extends FormElementPart {
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

export type FormQuestionFollow = FormQuestion & FormElementsFollowContainer & {
    question: QuestionFollow;
};
export type FormSectionOrForm = FormInForm | FormSection;
export type FormSectionOrFormFollow = FormInFormFollow | FormSectionFollow;
export type FormElement = FormInForm | FormSection | FormQuestion;
export type FormElementFollow = FormInFormFollow | FormSectionFollow | FormQuestionFollow;
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

export class PermissibleFormValue extends PermissibleValue implements FormElementsContainer { // view model
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
    multiselect?: boolean;
};

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

export class QuestionCde extends EltRefCaching { // copied from original data element, not configurable
    definitions: Definition[] = [];
    derivationRules: DerivationRule[] = [];
    designations: Designation[] = [];
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
