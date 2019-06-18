import async_forEachOf from 'async/forEachOf';
import async_forEachSeries from 'async/forEachSeries';
import _noop from 'lodash/noop';

export function addFormIds(parent, parentId = '') {
    function addFeId(fe, parentId, i) {
        fe.feId = parentId + i;
        return fe.feId + '-';
    }
    iterateFeSync(parent, addFeId, addFeId, addFeId, parentId ? parentId + '-' : '');
}

export function flattenFormElement(fe) {
    function pushLeaf(fe) {
        if (!fe.formElements || fe.formElements.length === 0) {
            result.push(fe);
        }
    }

    let result = [];
    iterateFeSync(fe, pushLeaf, pushLeaf, pushLeaf);
    return result;
}

export function getLabel(fe) {
    if (fe.label)
        return fe.label;
    return fe.question && fe.question.cde ? fe.question.cde.name : '';
}

// implemented options: return, skip
// feCb(fe, cbContinue(error, newOptions), options)
//     cbContinue skip: noopSkipIterCb()
// callback(error)
export function iterateFe(fe, formCb = undefined, sectionCb = undefined, questionCb = undefined, callback = undefined, options = undefined) {
    if (fe) {
        iterateFes(fe.formElements, formCb, sectionCb, questionCb, callback, options);
    } else {
        callback();
    }
}

// feCb(fe, pass): return
export function iterateFeSync(fe, formCb = undefined, sectionCb = undefined, questionCb = undefined, pass = undefined) {
    if (fe) {
        return iterateFesSync(fe.formElements, formCb, sectionCb, questionCb, pass);
    }
}

// implemented options: skip
// feCb(fe, pass, options): return
//   skip: noopSkipSync
export function iterateFeSyncOptions(fe, formCb = undefined, sectionCb = undefined, questionCb = undefined, pass = undefined) {
    if (fe) {
        return iterateFesSyncOptions(fe.formElements, formCb, sectionCb, questionCb, pass);
    }
}

// implemented options: return, skip
// feCb(fe, cbContinue(error, newOptions), options)
//     cbContinue skip: noopSkipIterCb()
// callback(error)
export function iterateFes(fes, formCb = noopIterCb, sectionCb = noopIterCb, questionCb = noopIterCb, callback = _noop, options = undefined) {
    if (!Array.isArray(fes)) {
        return callback();
    }
    async_forEachOf(fes, (fe, i, cb) => {
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
export function iterateFesSync(fes, formCb = noopSync, sectionCb = noopSync, questionCb = noopSync, pass = undefined) {
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
export function iterateFesSyncOptions(fes, formCb = noopSync, sectionCb = noopSync, questionCb = noopSync, pass = undefined) {
    /* jshint -W030 */
    Array.isArray(fes) && fes.forEach((fe, i) => {
        let options = {};
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

export function noopIterCb(dummy, cb, options) {
    cb(undefined, options);
}

export function noopSkipIterCb(dummy, cb) {
    cb(undefined, {skip: true});
}

export function noopSkipSync(dummy, pass, options) {
    options.skip = true;
    return pass;
}

export function noopSync(dummy, pass) {
    return pass;
}

export function iterateFormElements(fe = {}, option = {}, cb = undefined) {
    if (!fe.formElements) fe.formElements = [];
    if (!Array.isArray(fe.formElements)) {
        cb();
        return;
    }
    if (option.async) {
        async_forEachSeries(fe.formElements, (fe, doneOneFe) => {
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
        fe.formElements.forEach(fe => {
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

export function questionMulti(q) {
    return questionQuestionMulti(q.question);
}

export function questionQuestionMulti(question) {
    return question.multiselect || question.answers.filter(a => !a.nonValuelist).length === 1 && !question.required;
}

export function trimWholeForm(elt) {
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
