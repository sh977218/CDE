import {
    CdeForm, FormElement, FormElementsContainer, FormInForm, FormQuestion, FormSection, QuestionCde
} from 'shared/form/form.model';

// async callbacks
type cb = (error?: string) => void;
type continueCb = (error?: string, options?: any) => void; // options (skip: skip children) (return: pass data to children) extendable
type informCb = (fe: FormInForm, continueCb: continueCb, options?: any) => void;
type quesCb = (fe: FormQuestion, continueCb: continueCb, options?: any) => void;
type sectionCb = (fe: FormSection, continueCb: continueCb, options?: any) => void;

// sync callbacks
// returns data as "pass" to children
type informCbSync = (fe: FormInForm, pass?: any) => any;
type quesCbSync = (fe: FormQuestion, pass?: any) => any;
type sectionCbSync = (fe: FormSection, pass?: any) => any;

// sync callbacks with options
// returns data as "pass" to children
// options are extendable
//     skip: skip children
type informOptionsCbSync = (fe: FormInForm, pass?: any, options?: any) => any;
type quesOptionsCbSync = (fe: FormQuestion, pass?: any, options?: any) => any;
type sectionOptionsCbSync = (fe: FormSection, pass?: any, options?: any) => any;

declare function addFormIds(parent: CdeForm, parentId?: string): void;
declare function areDerivationRulesSatisfied(elt: FormElementsContainer): {tinyId: string}[];
declare function convertFormToSection(elt: CdeForm): FormInForm;
declare function findQuestionByTinyId(tinyId: string, elt: FormElementsContainer): FormQuestion;
declare function flattenFormElement(fe: FormElement): FormElement[];
declare function getFormCdes(form: FormElementsContainer): QuestionCde[];
declare function getFormQuestions(form: FormElementsContainer): FormQuestion[];
declare function getFormQuestionsReal(form: FormElementsContainer): FormQuestion[];
declare function getFormOdm(form: FormElementsContainer, cb: (error: string, odm: any) => void): void;
declare function getLabel(fe: FormElement): string;
declare function isSubForm(node: any): boolean;
declare function iterateFe(fe, formCb?: informCb, sectionCb?: sectionCb, questionCb?: quesCb, callback?: cb, options?: any): void;
declare function iterateFeSync(fe: FormElementsContainer, formCb?: informCbSync, sectionCb?: sectionCbSync, questionCb?: quesCbSync, pass?: any): any;
declare function iterateFeSyncOptions(fe: FormElementsContainer, formCb?: informOptionsCbSync, sectionCb?: sectionOptionsCbSync, questionCb?: quesOptionsCbSync, pass?: any): any;
declare function iterateFes(fes: FormElement[], formCb?: informCb, sectionCb?: sectionCb, questionCb?: quesCb, callback?: cb, options?: any): void;
declare function iterateFesSync(fes: FormElement[], formCb?: informCbSync, sectionCb?: sectionCbSync, questionCb?: quesCbSync, pass?: any): any;
declare function iterateFesSyncOptions(fes: FormElement[], formCb?: informOptionsCbSync, sectionCb?: sectionOptionsCbSync, questionCb?: quesOptionsCbSync, pass?: any): any;
declare function iterateFormElements(fe?: any, option?: any, cb?: any): void;
declare function noopSkipCb(_: any, cb: continueCb): void;
declare function noopSkipSync(_?: any): boolean;
declare function score(question: FormQuestion, elt: FormElementsContainer): any; // returns number for success and string for failure
declare function trimWholeForm(elt: CdeForm): void;
