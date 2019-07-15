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
    DatatypeContainer,
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
    elementType?: string = 'form';
    expanded?: boolean; // calculated, formDescription view model
    formInput?: {[key: string]: QuestionValue}; // volatile, nativeRender and export
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
                if (!Array.isArray(q.question.unitsOfMeasure)) q.question.unitsOfMeasure = [];
                if (!q.question.cde) q.question.cde = new QuestionCde();
                if (!Array.isArray(q.question.cde.derivationRules)) q.question.cde.derivationRules = [];
                if (!Array.isArray(q.question.uomsAlias)) q.question.uomsAlias = [];
                if (!Array.isArray(q.question.uomsValid)) q.question.uomsValid = [];
                switch (q.question.datatype) {
                    case 'Value List':
                        if (!Array.isArray(q.question.answers)) q.question.answers = [];
                        if (!Array.isArray(q.question.cde.permissibleValues)) q.question.cde.permissibleValues = [];
                        break;
                    case 'Date':
                        if (!q.question.datatypeDate) q.question.datatypeDate = new QuestionTypeDate();
                        break;
                    case 'Geo Location':
                    case 'Time':
                    case 'Externally Defined':
                    case 'File':
                        break;
                    case 'Number':
                        if (!q.question.datatypeNumber) q.question.datatypeNumber = new QuestionTypeNumber();
                        break;
                    case 'Text':
                    default:
                        if (!q.question.datatypeText) q.question.datatypeText = new QuestionTypeText();
                        break;
                }
            }
        );
    }
}

export class CdeFormElastic extends CdeForm { // all volatile
    [key: string]: any; // used for highlighting
    flatClassifications?: string[];
    highlight?: any;
    numQuestions?: number;
    primaryDefinitionCopy?: string;
    primaryNameCopy?: string;
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

export interface FormElementsContainer {
    expanded?: boolean; // calculated, formDescription view model
    formElements: FormElement[];
}

interface FormElementPart extends FormElementsContainer {
    _id?: ObjectId; // TODO: remove
    readonly elementType: 'section' | 'form' | 'question';
    expanded?: boolean; // calculated, formDescription view model
    feId?: string; // calculated, nativeRender and formView view model
    formElements: FormElement[];
    instructions?: Instruction;
    label?: string;
    mapTo?: ExternalMappings; // calculated, used by: FHIR
    metadataTags?: MetadataTag[]; // calculated, used by FHIR
    repeat?: string;
    skipLogic?: SkipLogic;
    updatedSkipLogic?: boolean; // calculated, formDescription view model
}

export interface FormSectionOrFormPart extends FormElementPart {
    forbidMatrix?: boolean; // Calculated, used for Follow View Model
    isCopied?: 'copied' | 'clear'; // volatile, form description
}

export class FormSection implements FormSectionOrFormPart {
    _id?: ObjectId; // TODO: remove
    edit?: boolean; // calculated, formDescription view model
    readonly elementType = 'section';
    expanded?: boolean = true; // calculated, formDescription view model
    feId?: string; // calculated, nativeRender and formView view model
    forbidMatrix?: boolean; // calculated, nativeRender view model
    formElements: FormElement[] = [];
    hover?: boolean; // calculated, formDescription view model
    instructions?: Instruction;
    isCopied?: 'copied' | 'clear'; // volatile, form description
    label?: string = '';
    mapTo?: ExternalMappings;
    metadataTags?: MetadataTag[];
    repeat?: string;
    repeatNumber?: number; // calculated, formDescription view model
    repeatOption?: string; // calculated, formDescription view model
    repeatQuestion?: string; // calculated, formDescription view model
    section = new Section();
    skipLogic?: SkipLogic = new SkipLogic();
    updatedSkipLogic?: boolean; // calculated, formDescription view model
}

export class FormInForm implements FormSectionOrFormPart {
    _id?: ObjectId; // TODO: remove
    edit?: boolean; // calculated, formDescription view model
    readonly elementType = 'form';
    expanded?: boolean = false; // calculated, formDescription view model
    feId?: string; // calculated, nativeRender and formView view model
    forbidMatrix?: boolean; // calculated, nativeRender view model
    formElements: FormElement[] = [];
    hover?: boolean; // calculated, formDescription view model
    instructions?: Instruction;
    inForm = new InForm();
    isCopied?: 'copied' | 'clear'; // volatile, form description
    label?: string = '';
    mapTo?: ExternalMappings;
    metadataTags?: MetadataTag[];
    repeat?: string;
    repeatNumber?: number; // calculated, formDescription view model
    repeatOption?: string; // calculated, formDescription view model
    repeatQuestion?: string; // calculated, formDescription view model
    skipLogic?: SkipLogic = new SkipLogic();
    updatedSkipLogic?: boolean; // calculated, formDescription view model
}

export class FormQuestion implements FormElementPart {
    _id?: ObjectId; // TODO: remove
    edit?: boolean = false; // calculated, formDescription view model
    readonly elementType = 'question';
    expanded?: boolean = true; // calculated, formDescription view model
    feId?: string; // calculated, nativeRender and formView view model
    formElements: FormElement[] = [];
    hover?: boolean = false; // calculated, formDescription view model
    incompleteRule?: boolean;
    instructions?: Instruction;
    label?: string = '';
    mapTo?: ExternalMappings;
    metadataTags?: MetadataTag[];
    question = new Question();
    repeat?: string;
    skipLogic?: SkipLogic = new SkipLogic();
    updatedSkipLogic?: boolean; // calculated, formDescription view model

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

export type FormSectionOrForm = FormInForm | FormSection;
export type FormElement = FormInForm | FormSection | FormQuestion;
export type FormOrElement = CdeForm | FormElement;

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
    formElements!: FormElement[]; // volatile, nativeRender
    index?: number;
    nonValuelist?: boolean;
}

export class Question extends DatatypeContainer {
    answer?: QuestionValue; // volatile, input value
    answerVM?: any[]; // volatile, input value for select
    answerUom?: CodeAndSystem; // volatile, input uom value
    answerDate?: any; // volatile, working storage for date part
    answerTime?: any; // volatile, working storage for time part
    answers?: PermissibleFormValue[]; // mutable
    cde: QuestionCde = new QuestionCde();
    defaultAnswer?: string; // all datatypes, defaulted by areDerivationRulesSatisfied
    editable?: boolean = true;
    invisible?: boolean;
    isScore?: boolean;
    scoreFormula?: string;
    scoreError?: string;
    multiselect?: boolean;
    partOf?: string; // volatile, display '(part of ...)' in Form Description
    required?: boolean;
    previousUom?: CodeAndSystem; // volatile, native render question renderer
    unitsOfMeasure: CodeAndSystem[] = [];
    uomsAlias: string[] = []; // volatile, NativeRenderService
    uomsValid: string[] = []; // volatile, FormDescription
}

export class QuestionCde extends EltRefCaching { // copied from original data element, not configurable
    datatype?: string; // volatile, use by save new cde
    definitions: Definition[] = [];
    derivationRules: DerivationRule[] = [];
    designations: Designation[] = [];
    naming = [];
    permissibleValues?: PermissibleValue[];
}

class Section {
}

export class SkipLogic {
    action?: string;
    condition: string = '';
    validationError?: string;
}
