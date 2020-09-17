import * as forEachOf from 'async/forEachOf';
import * as forEachSeries from 'async/forEachSeries';
import { CbErrorObj } from 'shared/models.model';
import {
    FormElement, FormElementsContainer, FormInForm, FormQuestion, FormSection, Question, QuestionValueList,
} from 'shared/form/form.model';

// async callbacks
type IterateOptions = any;
type continueCb<E> = (error?: E, options?: any) => void; // options (skip: skip children) (return: pass data to children) extendable
type informCb<E> = (fe: FormInForm, continueCb: continueCb<E>, options?: IterateOptions, key?: any) => void;
type quesCb<E> = (fe: FormQuestion, continueCb: continueCb<E>, options?: IterateOptions, key?: any) => void;
type sectionCb<E> = (fe: FormSection, continueCb: continueCb<E>, options?: IterateOptions, key?: any) => void;

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
    // assign name ids of format 'prefix_section#-section#-question#_suffix'
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

    const result: FormQuestion[] = [];
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

export function isInForm(fe: FormElement): fe is FormInForm {
    return fe && fe.elementType === 'form';
}

export function isQuestion(fe: FormElement): fe is FormQuestion {
    return fe && fe.elementType === 'question';
}

export function isScore(question: Question): boolean {
    return question.cde.derivationRules && question.cde.derivationRules.length > 0;
}

export function isSection(fe: FormElement): fe is FormSection {
    return fe && fe.elementType === 'section';
}

// implemented options: return, skip
// feCb(fe, cbContinue(error, newOptions), options)
//     cbContinue skip: noopSkipIterCb()
// callback(error)
export function iterateFe<E = Error>(fe: FormElementsContainer, formCb: informCb<E> | undefined, sectionCb: sectionCb<E> | undefined,
                                     questionCb: quesCb<E> | undefined, callback: CbErrorObj<E | void>, options?: IterateOptions): void {
    if (fe) {
        iterateFes(fe.formElements, formCb, sectionCb, questionCb, callback, options);
    } else {
        callback();
    }
}

// feCb(fe, pass): return
export function iterateFeSync(fe: FormElementsContainer, formCb?: informCbSync, sectionCb?: sectionCbSync,
                              questionCb?: quesCbSync, pass?: any): any {
    if (fe) {
        return iterateFesSync(fe.formElements, formCb, sectionCb, questionCb, pass);
    }
}

// implemented options: skip
// feCb(fe, pass, options): return
//   skip: noopSkipSync
export function iterateFeSyncOptions(fe: FormElementsContainer, formCb?: informOptionsCbSync,
                                     sectionCb?: sectionOptionsCbSync, questionCb?: quesOptionsCbSync, pass?: any): any {
    if (fe) {
        return iterateFesSyncOptions(fe.formElements, formCb, sectionCb, questionCb, pass);
    }
}

// implemented options: return, skip
// feCb(fe, cbContinue(error, newOptions), options)
//     cbContinue skip: noopSkipIterCb()
// callback(error)
export function iterateFes<E = Error>(fes: FormElement[], formCb: informCb<E> = noopIterCb, sectionCb: sectionCb<E> = noopIterCb,
                                      questionCb: quesCb<E> = noopIterCb, callback: CbErrorObj<E | void> = () => {},
                                      options?: IterateOptions): void {
    if (!Array.isArray(fes)) {
        return callback();
    }
    forEachOf(fes, (fe: FormElement, i: number, cb: CbErrorObj<E | void>) => {
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
export function iterateFesSync(fes: FormElement[], formCb: informCbSync = noopSync, sectionCb: sectionCbSync = noopSync,
                               questionCb: quesCbSync = noopSync, pass?: any): any {
    if (Array.isArray(fes)) {
        fes.forEach((fe, i) => {
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
    }
    return pass;
}

// implemented options: skip
// feCb(fe, pass, options): return
//   skip: noopSkipSync
export function iterateFesSyncOptions(fes: FormElement[], formCb: informOptionsCbSync = noopSync,
                                      sectionCb: sectionOptionsCbSync = noopSync, questionCb: quesOptionsCbSync = noopSync,
                                      pass?: any): any {
    if (Array.isArray(fes)) {
        fes.forEach((fe, i) => {
            const options: IterateOptionsSync = {};
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
    }
    return pass;
}

export function noopIterCb<E>(fe: FormElement, continueCb: continueCb<E>, options?: IterateOptions): void {
    continueCb(undefined, options);
}

export function noopSkipIterCb<E>(dummy: FormElement, cb: continueCb<E>): void {
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
    if (!fe.formElements) {
        fe.formElements = [];
    }
    if (!Array.isArray(fe.formElements)) {
        cb();
        return;
    }
    if (option.async) {
        forEachSeries(fe.formElements, (fe: FormElement, doneOneFe: CbErrorObj<string | void>) => {
            if (fe.elementType === 'section') {
                if (option.sectionCb) {
                    option.sectionCb(fe, doneOneFe);
                } else {
                    iterateFormElements(fe, option, doneOneFe);
                }
            } else if (fe.elementType === 'form') {
                if (option.formCb) {
                    option.formCb(fe, doneOneFe);
                } else {
                    iterateFormElements(fe, option, doneOneFe);
                }
            } else if (fe.elementType === 'question') {
                if (option.questionCb) {
                    option.questionCb(fe, doneOneFe);
                } else {
                    doneOneFe();
                }
            } else {
                doneOneFe();
            }
        }, cb);
    } else {
        fe.formElements.forEach((fe: FormElement) => {
            if (fe.elementType === 'section') {
                if (option.sectionCb) {
                    option.sectionCb(fe);
                } else {
                    iterateFormElements(fe, option);
                }
            } else if (fe.elementType === 'form') {
                if (option.formCb) {
                    option.formCb(fe);
                } else {
                    iterateFormElements(fe, option);
                }
            } else if (fe.elementType === 'question') {
                if (option.questionCb) {
                    option.questionCb(fe);
                }
            }
        });
        if (cb) {
            cb();
        }
    }
}

export function questionMulti(q: FormQuestion): boolean {
    return q.question.datatype === 'Value List' && questionQuestionMulti(q.question);
}

export function questionQuestionMulti(question: QuestionValueList): boolean {
    return question.multiselect || question.answers.filter(a => !a.nonValuelist).length === 1 && !question.required;
}

export function trimWholeForm(elt: FormElementsContainer): void {
    iterateFeSync(elt, f => {
        f.formElements = []; // remove subForm content
    }, undefined, q => {
        const question = q.question as any; // cleanup requires any
        switch (q.question.datatype) {
            case 'Value List':
                question.datatypeDate = undefined;
                question.datatypeNumber = undefined;
                question.datatypeText = undefined;
                question.datatypeExternallyDefined = undefined;
                break;
            case 'Date':
                question.datatypeValueList = undefined;
                question.datatypeNumber = undefined;
                question.datatypeText = undefined;
                question.datatypeExternallyDefined = undefined;
                break;
            case 'Number':
                question.datatypeValueList = undefined;
                question.datatypeDate = undefined;
                question.datatypeText = undefined;
                question.datatypeExternallyDefined = undefined;
                break;
            case 'Text':
            /* falls through */
            default:
                question.datatypeValueList = undefined;
                question.datatypeDate = undefined;
                question.datatypeNumber = undefined;
                question.datatypeExternallyDefined = undefined;
        }
    });
}
