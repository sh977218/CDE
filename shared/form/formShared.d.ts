import { CbErr } from 'shared/models.model';
import {
    CdeForm, FormElement, FormElementsContainer, FormInForm, FormQuestion, FormSection, Question, QuestionCde
} from 'shared/form/form.model';

// async callbacks
type IterateOptions = any;
type continueCb = (error?: string, options?: any) => void; // options (skip: skip children) (return: pass data to children) extendable
type informCb = (fe: FormInForm, continueCb: continueCb, options?: IterateOptions) => void;
type quesCb = (fe: FormQuestion, continueCb: continueCb, options?: IterateOptions) => void;
type sectionCb = (fe: FormSection, continueCb: continueCb, options?: IterateOptions) => void;

// sync callbacks
// returns data as "pass" to children
type informCbSync = (fe: FormInForm, pass?: any) => any;
type quesCbSync = (fe: FormQuestion, pass?: any) => any;
type sectionCbSync = (fe: FormSection, pass?: any) => any;

// sync callbacks with options
// returns data as "pass" to children
// options are extendable
//     skip: skip children
type IterateOptionsSync = IterateOptions;
type informOptionsCbSync = (fe: FormInForm, pass?: any, options?: IterateOptionsSync) => any;
type quesOptionsCbSync = (fe: FormQuestion, pass?: any, options?: IterateOptionsSync) => any;
type sectionOptionsCbSync = (fe: FormSection, pass?: any, options?: IterateOptionsSync) => any;

declare function addFormIds(parent: CdeForm, parentId?: string): void;
declare function areDerivationRulesSatisfied(elt: FormElementsContainer): string[];
declare function convertFormToSection(elt: CdeForm): FormInForm;
declare function findQuestionByTinyId(tinyId: string, elt: FormElementsContainer): FormQuestion;
declare function flattenFormElement(fe: FormElement): FormElement[];
declare function getFormQuestions(form: FormElementsContainer): FormQuestion[];
declare function getFormQuestionsAsQuestion(form: FormElementsContainer): Question[];
declare function getFormQuestionsAsQuestionCde(form: FormElementsContainer): QuestionCde[];
declare function getFormOdm(form: FormElementsContainer, cb: (error: string, odm: any) => void): void;
declare function getLabel(fe: FormElement): string;
declare function isSubForm(node: any): boolean;
declare function iterateFe(fe: FormElementsContainer, formCb?: informCb, sectionCb?: sectionCb, questionCb?: quesCb, callback?: CbErr, options?: IterateOptions): void;
declare function iterateFeSync(fe: FormElementsContainer, formCb?: informCbSync, sectionCb?: sectionCbSync, questionCb?: quesCbSync, pass?: any): any;
declare function iterateFeSyncOptions(fe: FormElementsContainer, formCb?: informOptionsCbSync, sectionCb?: sectionOptionsCbSync, questionCb?: quesOptionsCbSync, pass?: any): any;
declare function iterateFes(fes: FormElement[], formCb?: informCb, sectionCb?: sectionCb, questionCb?: quesCb, callback?: CbErr, options?: IterateOptions): void;
declare function iterateFesSync(fes: FormElement[], formCb?: informCbSync, sectionCb?: sectionCbSync, questionCb?: quesCbSync, pass?: any): any;
declare function iterateFesSyncOptions(fes: FormElement[], formCb?: informOptionsCbSync, sectionCb?: sectionOptionsCbSync, questionCb?: quesOptionsCbSync, pass?: any): any;
declare function iterateFormElements(fe?: any, option?: any, cb?: any): void;
declare function noopIterCb(fe: FormElement, continueCb: continueCb, options?: IterateOptions): void;
declare function noopSkipIterCb(_: FormElement, cb: continueCb): void;
declare function noopSkipSync(_: FormElement, pass?: any, options?: IterateOptionsSync): any;
declare function noopSync(_: FormElement, pass: any): any;
declare function questionAnswered(q: FormQuestion): boolean;
declare function score(question: FormQuestion, elt: FormElementsContainer): any; // returns number for success and string for failure
declare function trimWholeForm(elt: CdeForm): void;
