import { CbErr } from '../../shared/models.model';
import {
    FormElement, FormElementsContainer, FormInForm, FormQuestion, FormSection, Question,
} from '../../shared/form/form.model';
import * as async_forEachOf from 'async/forEachOf';
import * as async_forEachSeries from 'async/forEachSeries';

// async callbacks
type IterateOptions = any;
type continueCb = (error?: string, options?: any) => void; // options (skip: skip children) (return: pass data to children) extendable
type informCb = (fe: FormInForm, continueCb: continueCb, options?: IterateOptions, key?: any) => void;
type quesCb = (fe: FormQuestion, continueCb: continueCb, options?: IterateOptions, key?: any) => void;
type sectionCb = (fe: FormSection, continueCb: continueCb, options?: IterateOptions, key?: any) => void;

// sync callbacks
// returns data as "pass" to children
type informCbSync = (fe: FormInForm, pass?: any, key?: any) => any;
type quesCbSync = (fe: FormQuestion, pass?: any, key?: any) => any;
type sectionCbSync = (fe: FormSection, pass?: any, key?: any) => any;

// sync callbacks with options
// returns data as "pass" to children
// options are extendable
//     skip: skip children
type IterateOptionsSync = IterateOptions;
type informOptionsCbSync = (fe: FormInForm, pass?: any, options?: IterateOptionsSync, key?: any) => any;
type quesOptionsCbSync = (fe: FormQuestion, pass?: any, options?: IterateOptionsSync, key?: any) => any;
type sectionOptionsCbSync = (fe: FormSection, pass?: any, options?: IterateOptionsSync, key?: any) => any;



export function addFormIds(parent: FormElementsContainer, parentId = ''): void {
    function addFeId(fe: FormElement, parentId: string, i: number) {
        fe.feId = parentId + i;
        return fe.feId + '-';
    }
    iterateFeSync(parent, addFeId, addFeId, addFeId, parentId ? parentId + '-' : '');
}

export function flattenFormElement(fe: FormElementsContainer): FormQuestion[] {
    function pushLeaf(fe: FormElementsContainer) {
        if (!fe.formElements || fe.formElements.length === 0) {
            result.push(fe as FormQuestion);
        }
    }

    let result: FormQuestion[] = [];
    iterateFeSync(fe, pushLeaf, pushLeaf, pushLeaf);
    return result;
}

export function getLabel(fe: FormElement): string {
    if (fe.label) {
        return fe.label;
    }
    fe = fe as FormQuestion;
    return fe.question && fe.question.cde && fe.question.cde.name || '';
}

// implemented options: return, skip
// feCb(fe, cbContinue(error, newOptions), options)
//     cbContinue skip: noopSkipIterCb()
// callback(error)
export function iterateFe(fe: FormElementsContainer, formCb: informCb | undefined, sectionCb: sectionCb | undefined, questionCb: quesCb | undefined, callback: CbErr, options?: IterateOptions): void {
    if (fe) {
        iterateFes(fe.formElements, formCb, sectionCb, questionCb, callback, options);
    } else {
        callback();
    }
}

// feCb(fe, pass): return
export function iterateFeSync(fe: FormElementsContainer, formCb?: informCbSync, sectionCb?: sectionCbSync, questionCb?: quesCbSync, pass?: any): any {
    if (fe) {
        return iterateFesSync(fe.formElements, formCb, sectionCb, questionCb, pass);
    }
}

// implemented options: skip
// feCb(fe, pass, options): return
//   skip: noopSkipSync
export function iterateFeSyncOptions(fe: FormElementsContainer, formCb?: informOptionsCbSync, sectionCb?: sectionOptionsCbSync, questionCb?: quesOptionsCbSync, pass?: any): any {
    if (fe) {
        return iterateFesSyncOptions(fe.formElements, formCb, sectionCb, questionCb, pass);
    }
}

// implemented options: return, skip
// feCb(fe, cbContinue(error, newOptions), options)
//     cbContinue skip: noopSkipIterCb()
// callback(error)
export function iterateFes(fes: FormElement[], formCb: informCb = noopIterCb, sectionCb: sectionCb = noopIterCb, questionCb: quesCb = noopIterCb, callback: CbErr = () => {}, options?: IterateOptions): void {
    if (!Array.isArray(fes)) {
        return callback();
    }
    async_forEachOf(fes, (fe: FormElement, i: number, cb: CbErr) => {
        switch (fe.elementType) {
            case 'form':
                formCb(fe, (err, options = undefined) => {
                    if (err || options && options.skip) {
                        cb(err);
                        return;
                    }
                    iterateFe(fe, formCb, sectionCb, questionCb, cb, options);
                }, options, i);
                break;
            case 'section':
                sectionCb(fe, (err, options = undefined) => {
                    if (err || options && options.skip) {
                        cb(err);
                        return;
                    }
                    iterateFe(fe, formCb, sectionCb, questionCb, cb, options);
                }, options, i);
                break;
            case 'question':
                questionCb(fe, cb, options, i);
                break;
        }
    }, callback);
}

// feCb(fe, pass): return
export function iterateFesSync(fes: FormElement[], formCb: informCbSync = noopSync, sectionCb: sectionCbSync = noopSync, questionCb: quesCbSync = noopSync, pass?: any): any {
    /* jshint -W030 */
    Array.isArray(fes) && fes.forEach((fe, i) => {
        switch (fe.elementType) {
            case 'form':
                iterateFeSync(fe, formCb, sectionCb, questionCb, formCb(fe, pass, i));
                break;
            case 'section':
                iterateFeSync(fe, formCb, sectionCb, questionCb, sectionCb(fe, pass, i));
                break;
            case 'question':
                questionCb(fe, pass, i);
                break;
        }
    });
    return pass;
}

// implemented options: skip
// feCb(fe, pass, options): return
//   skip: noopSkipSync
export function iterateFesSyncOptions(fes: FormElement[], formCb: informOptionsCbSync = noopSync, sectionCb: sectionOptionsCbSync = noopSync, questionCb: quesOptionsCbSync = noopSync, pass?: any): any {
    /* jshint -W030 */
    Array.isArray(fes) && fes.forEach((fe, i) => {
        let options: IterateOptionsSync = {};
        let ret;
        switch (fe.elementType) {
            case 'form':
                ret = formCb(fe, pass, options, i);
                if (!options.skip) {
                    iterateFeSyncOptions(fe, formCb, sectionCb, questionCb, ret);
                }
                break;
            case 'section':
                ret = sectionCb(fe, pass, options, i);
                if (!options.skip) {
                    iterateFeSyncOptions(fe, formCb, sectionCb, questionCb, ret);
                }
                break;
            case 'question':
                questionCb(fe, pass, options, i);
                break;
        }
    });
    return pass;
}

export function noopIterCb(fe: FormElement, continueCb: continueCb, options?: IterateOptions): void {
    continueCb(undefined, options);
}

export function noopSkipIterCb(dummy: FormElement, cb: continueCb): void {
    cb(undefined, {skip: true});
}

export function noopSkipSync(dummy: FormElement, pass?: any, options?: IterateOptionsSync): any {
    options.skip = true;
    return pass;
}

export function noopSync(dummy: FormElement, pass: any): any {
    return pass;
}

export function iterateFormElements(fe: any = {}, option: any = {}, cb?: any): void {
    if (!fe.formElements) fe.formElements = [];
    if (!Array.isArray(fe.formElements)) {
        cb();
        return;
    }
    if (option.async) {
        async_forEachSeries(fe.formElements, (fe: FormElement, doneOneFe: CbErr) => {
            if (fe.elementType === 'section') {
                if (option.sectionCb) option.sectionCb(fe, doneOneFe);
                else iterateFormElements(fe, option, doneOneFe);
            }
            else if (fe.elementType === 'form') {
                if (option.formCb) option.formCb(fe, doneOneFe);
                else iterateFormElements(fe, option, doneOneFe);
            }
            else if (fe.elementType === 'question') {
                if (option.questionCb) option.questionCb(fe, doneOneFe);
                else doneOneFe();
            } else {
                doneOneFe();
            }
        }, cb);
    } else {
        fe.formElements.forEach((fe: FormElement) => {
            if (fe.elementType === 'section') {
                if (option.sectionCb) option.sectionCb(fe);
                else iterateFormElements(fe, option);
            }
            else if (fe.elementType === 'form') {
                if (option.formCb) option.formCb(fe);
                else iterateFormElements(fe, option);
            }
            else if (fe.elementType === 'question') {
                if (option.questionCb) option.questionCb(fe);
            }
        });
        if (cb) cb();
    }
}

export function questionMulti(q: FormQuestion): boolean {
    return questionQuestionMulti(q.question);
}

export function questionQuestionMulti(question: Question): boolean {
    return question.multiselect || question.answers!.filter(a => !a.nonValuelist).length === 1 && !question.required;
}

export function trimWholeForm(elt: FormElementsContainer): void {
    iterateFeSync(elt, f => {
        f.formElements = []; // remove subForm content
    }, undefined, q => {
        switch (q.question.datatype) {
            case 'Value List':
                q.question.datatypeDate = undefined;
                q.question.datatypeNumber = undefined;
                q.question.datatypeText = undefined;
                q.question.datatypeExternallyDefined = undefined;
                break;
            case 'Date':
                q.question.datatypeValueList = undefined;
                q.question.datatypeNumber = undefined;
                q.question.datatypeText = undefined;
                q.question.datatypeExternallyDefined = undefined;
                break;
            case 'Number':
                q.question.datatypeValueList = undefined;
                q.question.datatypeDate = undefined;
                q.question.datatypeText = undefined;
                q.question.datatypeExternallyDefined = undefined;
                break;
            case 'Text':
            /* falls through */
            default:
                q.question.datatypeValueList = undefined;
                q.question.datatypeDate = undefined;
                q.question.datatypeNumber = undefined;
                q.question.datatypeExternallyDefined = undefined;
        }
    });
}