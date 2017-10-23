import { Injectable } from "@angular/core";
import { Http, Response } from "@angular/http";
import * as async from "components/async";
import * as _ from "lodash";
import { FormQuestion } from "../core/form.model";

function noop(a, cb) { cb(); }

@Injectable()
export class FormService {
    constructor(private http: Http) {
    }

    static areDerivationRulesSatisfied(elt) {
        let missingCdes = [];
        let allCdes = {};
        let allQuestions = [];
        FormService.iterateFeSync(elt, undefined, undefined, (fe) => {
            if (fe.question.datatype === 'Number' && !Number.isNaN(fe.question.defaultAnswer))
                fe.question.answer = Number.parseFloat(fe.question.defaultAnswer);
            else
                fe.question.answer = fe.question.defaultAnswer;
            allCdes[fe.question.cde.tinyId] = fe.question;
            allQuestions.push(fe);
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
                            missingCdes.push({tinyId: input});
                            quest.incompleteRule = true;
                        }
                    });
                });
        });
        return missingCdes;
    }

    // cb(err, elt)
    getForm(tinyId, id, cb = _.noop) {
        let url = "/form/" + tinyId;
        if (id) url = "/formById/" + id;
        this.http.get(url).map(res => res.json()).subscribe(res => {
            cb(null, res);
        }, cb);
    }

    getQuestions(fe, qLabel) {
        let result = [];
        fe.forEach((element) => {
            if (element.elementType !== "question")
                result = result.concat(this.getQuestions(element.formElements, qLabel));
            else {
                let label = element.label;
                if (!label || label.length === 0)
                    label = element.question.cde.name;
                if (label === qLabel)
                    result = result.concat(element);
            }
        });
        return result;
    }

    // modifies form to add sub-forms
    // callback(err: string)
    fetchWholeForm(form, callback = _.noop) {
        let formCb = (fe, cb) => {
            this.http.get('/form/' + fe.inForm.form.tinyId
                + (fe.inForm.form.version ? '/version/' + fe.inForm.form.version : ''))
                .map(function (res) {
                    return res.json();
                })
                .subscribe(function (response: any) {
                    fe.formElements = response.formElements;
                    cb();
                }, function (err) {
                    cb(err.statusText);
                });
        };
        function questionCb(fe, cb) {
            if (fe.question.cde.derivationRules)
                fe.question.cde.derivationRules.forEach(function (derRule) {
                    delete fe.incompleteRule;
                    if (derRule.ruleType === 'score') {
                        fe.question.isScore = true;
                        fe.question.scoreFormula = derRule.formula;
                    }
                });
            cb();
        }
        FormService.iterateFe(form, callback, formCb, undefined, questionCb);
    }

    findQuestionByTinyId(tinyId, elt) {
        let result = null;
        let doFormElement = function (formElt) {
            if (formElt.elementType === "question") {
                if (formElt.question.cde.tinyId === tinyId) {
                    result = formElt;
                }
            } else if (formElt.elementType === "section") {
                formElt.formElements.forEach(doFormElement);
            }
        };
        elt.formElements.forEach(doFormElement);
        return result;
    }

    // callback(error)
    // feCb(fe, cbContinue(error))
    static iterateFe(elt, callback = _.noop, formCb = noop, sectionCb = noop, questionCb = noop) {
        if (Array.isArray(elt.formElements))
            async.forEach(elt.formElements, (fe, cb) => {
                if (fe.elementType === 'form') {
                    formCb(fe, (err) => {
                        if (err)
                            cb(err);
                        else
                            this.iterateFe(fe, cb, formCb, sectionCb, questionCb);
                    });
                } else if (fe.elementType === 'section') {
                    sectionCb(fe, (err) => {
                        if (err)
                            cb(err);
                        else
                            this.iterateFe(fe, cb, formCb, sectionCb, questionCb);
                    });
                } else {
                    questionCb(fe, cb);
                }
            }, callback);
    }

    // cb(fe)
    static iterateFeSync(elt, formCb = _.noop, sectionCb = _.noop, questionCb = _.noop) {
        if (Array.isArray(elt.formElements))
            elt.formElements.forEach(fe => {
                if (fe.elementType === 'form') {
                    formCb(fe);
                    FormService.iterateFeSync(fe, formCb, sectionCb, questionCb);
                } else if (fe.elementType === 'section') {
                    sectionCb(fe);
                    FormService.iterateFeSync(fe, formCb, sectionCb, questionCb);
                } else {
                    questionCb(fe);
                }
            });
    };

    score(question, elt) {
        if (!question.question.isScore) return;
        let result: any = 0;
        let service = this;
        question.question.cde.derivationRules.forEach(function (derRule) {
            if (derRule.ruleType === "score") {
                if (derRule.formula === "sumAll" || derRule.formula === "mean") {
                    derRule.inputs.forEach(function (cdeTinyId) {
                        let q = service.findQuestionByTinyId(cdeTinyId, elt);
                        if (isNaN(result)) return;
                        if (q) {
                            let answer = q.question.answer;
                            if (answer == null) return result = "Incomplete answers";
                            if (isNaN(answer)) return result = "Unable to score";
                            else result = result + parseFloat(answer);
                        }
                    });
                }
                if (derRule.formula === "mean") {
                    if (!isNaN(result)) result = result / derRule.inputs.length;
                }
            }
        });
        return result;
    }

    convertCdeToQuestion(cde, cb): FormQuestion {
        if (cde.valueDomain !== undefined) {
            let question = {
                elementType: "question",
                label: cde.naming[0].designation,
                hideLabel: undefined,
                skipLogic: {
                    condition: ''
                },
                question: {
                    cde: {
                        tinyId: cde.tinyId,
                        version: cde.version,
                        derivationRules: cde.derivationRules,
                        name: cde.naming[0] ? cde.naming[0].designation : '',
                        ids: cde.ids ? cde.ids : [],
                        permissibleValues: []
                    },
                    datatype: cde.valueDomain.datatype,
                    datatypeDate: undefined,
                    datatypeNumber: undefined,
                    datatypeText: undefined,
                    required: false,
                    uoms: cde.valueDomain.uom ? [cde.valueDomain.uom] : [],
                    answers: []
                }
            };
            cde.naming.forEach(function (n) {
                if (!n.tags) n.tags = [];
                if (n.tags.filter(function (t) {
                        return t.toLowerCase().indexOf('Question Text') > 0;
                    }).length > 0) {
                    if (!n.designation || (n.designation && n.designation.trim().length === 0)) {
                        question.label = cde.naming[0].designation ? cde.naming[0].designation : '';
                        question.hideLabel = true;
                    } else {
                        question.label = n.designation;
                    }
                }
            });

            if (question.question.datatype === 'Number') {
                question.question.datatypeNumber = cde.valueDomain.datatypeNumber ? cde.valueDomain.datatypeNumber : {};
            } else if (question.question.datatype === 'Text') {
                question.question.datatypeText = cde.valueDomain.datatypeText ? cde.valueDomain.datatypeText : {};
            } else if (question.question.datatype === 'Date') {
                question.question.datatypeDate = cde.valueDomain.datatypeDate ? cde.valueDomain.datatypeDate : {};
            } else if (question.question.datatype === 'Value List') {
                if (cde.valueDomain.permissibleValues.length > 0) {
                    // elastic only store 10 pv, retrieve pv when have more than 9 pv.
                    if (cde.valueDomain.permissibleValues.length > 9) {
                        this.http.get("/de/" + cde.tinyId + "/version/" + (cde.version ? cde.version : ""))
                            .map((res: Response) => res.json())
                            .subscribe((result) => {
                                result.valueDomain.permissibleValues.forEach(function (pv) {
                                    if (!pv.valueMeaningName || pv.valueMeaningName.trim().length === 0) {
                                        pv.valueMeaningName = pv.permissibleValue;
                                    }
                                    question.question.answers.push(pv);
                                    question.question.cde.permissibleValues.push(pv);
                                });
                                cb(question);
                            }, err => cb());
                        return;
                    } else {
                        cde.valueDomain.permissibleValues.forEach(function (pv) {
                            if (!pv.valueMeaningName || pv.valueMeaningName.trim().length === 0) {
                                pv.valueMeaningName = pv.permissibleValue;
                            }
                            question.question.answers.push(pv);
                            question.question.cde.permissibleValues.push(pv);
                        });
                    }
                }
            }
            return cb(question);
        }
        else {
            return cb({});
        }
    }

    static convertFormToSection(form) {
        if (form.formElements)
            return {
                elementType: "form",
                label: form.naming[0] ? form.naming[0].designation : '',
                skipLogic: {
                    condition: ''
                },
                inForm: {
                    form: {
                        tinyId: form.tinyId,
                        version: form.version,
                        name: form.naming[0] ? form.naming[0].designation : '',
                        ids: form.ids
                    }
                }
            };
        else
            return {};
    }

    static isSubForm(node) {
        let n = node;
        while (n.data.elementType !== "form" && n.parent) {
            n = n.parent;
        }
        return n.data.elementType === "form";
    }
}