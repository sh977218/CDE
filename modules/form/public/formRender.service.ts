import { Injectable } from "@angular/core";

@Injectable()
export class FormRenderService {
    getQuestions(fe, qLabel) {
        let result = [];
        let service = this;
        fe.forEach(function (element) {
            if (element.elementType !== "question")
                result = result.concat(service.getQuestions(element.formElements, qLabel));
            else {
                let label = element.label;
                if (!label || label.length === 0) label = element.question.cde.name;
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
}