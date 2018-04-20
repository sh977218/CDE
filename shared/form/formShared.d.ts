import {
    CdeForm, FormElement, FormElementsContainer, FormInForm, FormQuestion, FormSection, QuestionCde
} from 'shared/form/form.model';

type informCb = (fe: FormInForm, continueCb: continueCb) => void;
type informCbSync = (fe: FormInForm) => (boolean|void); // returns skipChildren
type quesCb = (fe: FormQuestion, continueCb: continueCb) => void;
type quesCbSync = (fe: FormQuestion) => (boolean|void); // returns skipChildren
type sectionCb = (fe: FormSection, continueCb: continueCb) => void;
type sectionCbSync = (fe: FormSection) => (boolean|void); // returns skipChildren

type continueCb = (error?: string, skipChildren?: boolean) => void;
type cb = (error?: string) => void;

declare function addFormIds(parent: CdeForm, parentId?: string): void;
declare function areDerivationRulesSatisfied(elt: FormElementsContainer): {tinyId: string}[];
declare function convertFormToSection(elt: CdeForm): FormInForm;
declare function findQuestionByTinyId(tinyId: string, elt: FormElementsContainer): FormQuestion;
declare function flattenFormElement(fe: FormElement): FormElement[];
declare function getFormCdes(form: FormElementsContainer): QuestionCde[];
declare function getFormQuestions(form: FormElementsContainer): FormQuestion[];
declare function getFormOdm(form: FormElementsContainer, cb: (error: string, odm: any) => void): void;
declare function getLabel(fe: FormElement): string;
declare function isSubForm(node: any): boolean;
declare function iterateFe(fe, formCb?: informCb, sectionCb?: sectionCb, questionCb?: quesCb, callback?: cb): void;
declare function iterateFeSync(fe: FormElementsContainer, formCb?: informCbSync, sectionCb?: sectionCbSync, questionCb?: quesCbSync): void;
declare function iterateFes(fes: FormElement[], formCb?: informCb, sectionCb?: sectionCb, questionCb?: quesCb, callback?: cb): void;
declare function iterateFesSync(fes: FormElement[], formCb?: informCbSync, sectionCb?: sectionCbSync, questionCb?: quesCbSync): void;
declare function iterateFormElements(fe?: any, option?: any, cb?: any): void;
declare function noopSkipCb(_: any, cb: continueCb): void;
declare function noopSkipSync(_?: any): boolean;
declare function score(question: FormQuestion, elt: FormElementsContainer): any; // returns number for success and string for failure
declare function trimWholeForm(elt: CdeForm): void;
