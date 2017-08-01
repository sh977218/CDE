import { Injectable } from "@angular/core";
import { Http, Response } from "@angular/http";
import { FormQuestion } from "./form.model";

@Injectable()
export class FormService {
    constructor(private http: Http) {
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
                        return t.tag.toLowerCase().indexOf('Question Text') > 0;
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
                            }, err => {
                                console.log("err");
                            });
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
                        name: form.naming[0] ? form.naming[0].designation : ''
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

    get(tinyId) {
        let url = "/form/" + tinyId;
        return this.http.get(url).map(res => res.json());
    }

}