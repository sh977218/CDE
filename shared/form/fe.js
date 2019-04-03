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

export function areDerivationRulesSatisfied(elt) {
    let missingCdeTinyIds = [];
    let allCdes = {};
    let allQuestions = [];
    iterateFeSync(elt, undefined, undefined, (q) => {
        if (q.question.datatype === 'Number') {
            q.question.answer = Number.parseFloat(q.question.defaultAnswer);
        } else {
            q.question.answer = q.question.defaultAnswer;
        }
        allCdes[q.question.cde.tinyId] = q.question;
        allQuestions.push(q);
    });
    allQuestions.forEach(quest => {
        if (quest.question.cde.derivationRules)
            quest.question.cde.derivationRules.forEach(derRule => {
                delete quest.incompleteRule;
                if (derRule.ruleType === 'score') {
                    quest.question.isScore = true;
                    quest.question.scoreFormula = derRule.formula;
                }
                derRule.inputs.forEach(input => {
                    if (allCdes[input]) {
                        allCdes[input].partOf = 'score';
                    } else {
                        missingCdeTinyIds.push(input);
                        quest.incompleteRule = true;
                    }
                });
            });
    });
    return missingCdeTinyIds;
}

// excludes subForms
export function findQuestionByTinyId(tinyId, elt) {
    let question;
    iterateFeSyncOptions(elt, noopSkipSync, undefined, q => q.question.cde.tinyId === tinyId && (question = q));
    return question;
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

export function getFormQuestions(form) {
    let questions = [];
    iterateFeSync(form, undefined, undefined, q => questions.push(q));
    return questions;
}

export function getFormScoreQuestions(form) {
    let questions = [];
    iterateFeSync(form, undefined, undefined, q => q.question.isScore && questions.push(q));
    return questions;
}

export function getFormSkipLogicQuestions(form) {
    let questions = [];
    iterateFeSync(form, undefined, undefined, q => q.skipLogic.condition.length > 0 && questions.push(q));
    return questions;
}

export function getFormQuestionsAsQuestion(form) {
    return getFormQuestions(form).map(q => q.question);
}

export function getFormQuestionsAsQuestionCde(form) {
    return getFormQuestions(form).map(q => q.question.cde);
}

export function getLabel(fe) {
    if (fe.label)
        return fe.label;
    if (fe.question && fe.question.cde)
        return fe.question.cde.name;
    return '';
}

export function isInForm(fe) {
    return fe && fe.elementType === 'form';
}

export function isQuestion(fe) {
    return fe && fe.elementType === 'question';
}

export function isSection(fe) {
    return fe && fe.elementType === 'section';
}

// implemented options: return, skip
// feCb(fe, cbContinue(error, newOptions), options)
//     cbContinue skip: noopSkipIterCb()
// callback(error)
export function iterateFe(fe, formCb = undefined, sectionCb = undefined, questionCb = undefined, callback = undefined, options = undefined) {
    if (fe) {
        iterateFes(fe.formElements, formCb, sectionCb, questionCb, callback, options);
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
        return;
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
    if (!Array.isArray(fes)) {
        return;
    }
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
    return pass;
}

// implemented options: skip
// feCb(fe, pass, options): return
//   skip: noopSkipSync
export function iterateFesSyncOptions(fes, formCb = noopSync, sectionCb = noopSync, questionCb = noopSync, pass = undefined) {
    if (!Array.isArray(fes)) {
        return;
    }
    fes.forEach((fe, i) => {
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

export function questionAnswered(q) {
    return typeof(q.question.answer) !== 'undefined'
        && !(Array.isArray(q.question.answer) && q.question.answer.length === 0);
}

export function questionMulti(q) {
    return questionQuestionMulti(q.question);
}

export function questionQuestionMulti(question) {
    return question.multiselect || question.answers.filter(a => !a.nonValuelist).length === 1 && !question.required;
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

export function repeatFe(fe) {
    if (!fe.repeat) return '';
    if (fe.repeat[0] === 'F') return 'F';
    if (fe.repeat.startsWith('="') && fe.repeat.length >= 3 && fe.repeat.endsWith('"')) return '=';
    return 'N';
}

export function repeatFeLabel(fe) {
    switch (repeatFe(fe)) {
        case '=':
            return 'over Question Answer ' + fe.repeat.substr(1);
        case 'F':
            return 'over First Question';
        case 'N':
            return repeatFeNumber(fe) + ' times';
        default:
            return '';
    }
}

export function repeatFeNumber(fe) {
    return parseInt(fe.repeat);
}

export function repeatFeQuestion(fe) {
    return fe.repeat && fe.repeat[0] === '=' ? fe.repeat.substring(2, fe.repeat.length - 1) : '';
}

export function trimWholeForm(elt) {
    iterateFeSync(elt, f => {
        f.formElements = []; // remove subForm content
    }, undefined, q => {
        if (!q.question) return;
        switch (q.question.datatype) {
            case 'Value List':
                if (q.question.datatypeDate) q.question.datatypeDate = undefined;
                if (q.question.datatypeNumber) q.question.datatypeNumber = undefined;
                if (q.question.datatypeText) q.question.datatypeText = undefined;
                if (q.question.datatypeExternallyDefined) q.question.datatypeExternallyDefined = undefined;
                break;
            case 'Date':
                if (q.question.datatypeValueList) q.question.datatypeValueList = undefined;
                if (q.question.datatypeNumber) q.question.datatypeNumber = undefined;
                if (q.question.datatypeText) q.question.datatypeText = undefined;
                if (q.question.datatypeExternallyDefined) q.question.datatypeExternallyDefined = undefined;
                break;
            case 'Number':
                if (q.question.datatypeValueList) q.question.datatypeValueList = undefined;
                if (q.question.datatypeDate) q.question.datatypeDate = undefined;
                if (q.question.datatypeText) q.question.datatypeText = undefined;
                if (q.question.datatypeExternallyDefined) q.question.datatypeExternallyDefined = undefined;
                break;
            case 'Text':
            /* falls through */
            default:
                if (q.question.datatypeValueList) q.question.datatypeValueList = undefined;
                if (q.question.datatypeDate) q.question.datatypeDate = undefined;
                if (q.question.datatypeNumber) q.question.datatypeNumber = undefined;
                if (q.question.datatypeExternallyDefined) q.question.datatypeExternallyDefined = undefined;
        }
    });
}
