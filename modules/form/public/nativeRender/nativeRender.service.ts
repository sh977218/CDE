import { Injectable } from "@angular/core";

@Injectable()
export class NativeRenderService1 {
    readonly SHOW_IF: string = "Dynamic";
}
@Injectable()
export class NativeRenderService {
    readonly SHOW_IF: string = "Dynamic";
    readonly FOLLOW_UP: string = "Follow-up";
    private errors: Array<string> = [];
    private overrideNativeRenderType: string = null;
    private currentNativeRenderType: string;

    profile: any;
    elt: any;
    form: any;
    followForm: any;

    getNativeRenderType() {
        let newType = this.overrideNativeRenderType || (this.profile && this.profile.displayType);
        if (newType !== this.currentNativeRenderType)
            this.setNativeRenderType(newType);

        return newType;
    }
    setNativeRenderType(userType) {
        if (userType === this.profile.displayType)
            this.overrideNativeRenderType = null;
        else if (userType === this.SHOW_IF || userType === this.FOLLOW_UP)
            this.overrideNativeRenderType = userType;
        else
            return;
        this.currentNativeRenderType = userType;

        if (this.getNativeRenderType() === this.FOLLOW_UP) {
            if (!this.followForm || this.elt.unsaved) {
                this.followForm = JSON.parse(JSON.stringify(this.elt));
                NativeRenderService.transformFormToInline(this.followForm);
                NativeRenderService.preprocessValueLists(this.followForm.formElements);
            }
        }
    }
    setSelectedProfile(profile = null) {
        if (profile)
            this.profile = profile;

        if (this.elt && this.elt.displayProfiles && this.elt.displayProfiles.length > 0 &&
            this.elt.displayProfiles.indexOf(this.profile) === -1)
            this.profile = this.elt.displayProfiles[0];

        if (!this.profile)
            this.profile = {
                name: "Default Config",
                displayInstructions: true,
                displayNumbering: true,
                sectionsAsMatrix: true,
                displayValues: false,
                displayType: this.FOLLOW_UP,
                numberOfColumns: 4,
                displayInvisible: false
            };
        this.setNativeRenderType(this.profile.displayType);
    }
    getElt() {
        switch (this.getNativeRenderType()) {
            case this.SHOW_IF:
                return this.elt;
            case this.FOLLOW_UP:
                return this.followForm;
        }
    }

    addError(msg: string) {
        this.errors.push(msg);
    }
    hasErrors() {
        return !!this.errors.length;
    }
    gerErrors() {
        return this.errors;
    }

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

    findQuestionByTinyId(tinyId) {
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
        this.getElt().formElements.forEach(doFormElement);
        return result;
    }

    score(question) {
        if (!question.question.isScore) return;
        let result: any = 0;
        let service = this;
        question.question.cde.derivationRules.forEach(function (derRule) {
            if (derRule.ruleType === "score") {
                if (derRule.formula === "sumAll" || derRule.formula === "mean") {
                    derRule.inputs.forEach(function (cdeTinyId) {
                        let q = service.findQuestionByTinyId(cdeTinyId);
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

    evaluateSkipLogic(condition, formElements, question) {
        if (!condition) return true;
        let rule = condition.trim();
        if (rule.indexOf("AND") > -1) {
            return this.evaluateSkipLogic(/.+AND/.exec(rule)[0].slice(0, -4), formElements, question) &&
                this.evaluateSkipLogic(/AND.+/.exec(rule)[0].substr(4), formElements, question);
        }
        if (rule.indexOf("OR") > -1) {
            return (this.evaluateSkipLogic(/.+OR/.exec(rule)[0].slice(0, -3), formElements, question) ||
            this.evaluateSkipLogic(/OR.+/.exec(rule)[0].substr(3), formElements, question));
        }
        let ruleArr = rule.split(/>=|<=|=|>|<|!=/);
        let questionLabel = ruleArr[0].replace(/"/g, "").trim();
        let operatorArr = />=|<=|=|>|<|!=/.exec(rule);
        if (!operatorArr) {
            this.errors.push("SkipLogic is incorrect. " + rule);
            return true;
        }
        let operator = operatorArr[0];
        let expectedAnswer = ruleArr[1].replace(/"/g, "").trim();
        let realAnswerArr = this.getQuestions(formElements, questionLabel);
        let realAnswerObj = realAnswerArr[0];
        let realAnswer = realAnswerObj ? (realAnswerObj.question.isScore ?
                this.score(realAnswerObj) : realAnswerObj.question.answer) : undefined;
        if (realAnswer === undefined || realAnswer === null ||
            (typeof realAnswer === "number" && isNaN(realAnswer))) realAnswer = "";
        if (expectedAnswer === "" && operator === "=") {
            if (realAnswerObj.question.datatype === "Number") {
                if (realAnswer === "" || isNaN(realAnswer)) return true;
            } else {
                if (realAnswer === "" || ("" + realAnswer).trim().length === 0) return true;
            }
        }
        else if (realAnswer || realAnswer === "") {
            if (realAnswerObj.question.datatype === "Date") {
                // format American DD/MM/YYYY to HTML5 standard YYYY-MM-DD
                if (realAnswer)
                    realAnswer = realAnswer.month + "/" + realAnswer.day + "/" + realAnswer.year;
                question.question.dateOptions = {};
                if (operator === "=") return new Date(realAnswer).getTime() === new Date(expectedAnswer).getTime();
                if (operator === "!=") return new Date(realAnswer).getTime() !== new Date(expectedAnswer).getTime();
                if (operator === "<") return new Date(realAnswer) < new Date(expectedAnswer);
                if (operator === ">") return new Date(realAnswer) > new Date(expectedAnswer);
                if (operator === "<=") return new Date(realAnswer) <= new Date(expectedAnswer);
                if (operator === ">=") return new Date(realAnswer) >= new Date(expectedAnswer);
            } else if (realAnswerObj.question.datatype === "Number") {
                if (operator === "=") return realAnswer === parseInt(expectedAnswer);
                if (operator === "!=") return realAnswer !== parseInt(expectedAnswer);
                if (operator === "<") return realAnswer < parseInt(expectedAnswer);
                if (operator === ">") return realAnswer > parseInt(expectedAnswer);
                if (operator === "<=") return realAnswer <= parseInt(expectedAnswer);
                if (operator === ">=") return realAnswer >= parseInt(expectedAnswer);
            } else if (realAnswerObj.question.datatype === "Text") {
                if (operator === "=") return realAnswer === expectedAnswer;
                if (operator === "!=") return realAnswer !== expectedAnswer;
                else return false;
            } else if (realAnswerObj.question.datatype === "Value List") {
                if (operator === "=") {
                    if (Array.isArray(realAnswer))
                        return realAnswer.indexOf(expectedAnswer) > -1;
                    else
                        return realAnswer === expectedAnswer;
                }
                if (operator === "!=") {
                    if (Array.isArray(realAnswer))
                        return realAnswer.length !== 1 || realAnswer[0] !== expectedAnswer;
                    else
                        return realAnswer !== expectedAnswer;
                }
                else return false;
            } else {
                if (operator === "=") return realAnswer === expectedAnswer;
                if (operator === "!=") return realAnswer !== expectedAnswer;
                else return false;
            }
        } else return false;
    }

    evaluateSkipLogicAndClear(rule, formElements, question) {
        let skipLogicResult = this.evaluateSkipLogic(rule, formElements, question);

        if (!skipLogicResult) question.question.answer = undefined;
        return skipLogicResult;
    }

    static transformFormToInline(form) {
        let prevQ = [];
        let transformed = false;
        let feSize = form.formElements.length;
        for (let i = 0; i < feSize; i++) {
            let fe = form.formElements[i];
            let qs = NativeRenderService.getShowIfQ(fe, prevQ);
            if (qs.length > 0) {
                let substituted = false;
                let parentQ = qs[0][0];
                qs.forEach(function (match) {
                    let answer;
                    if (parentQ.question.datatype === "Value List") {
                        if (match[3] === "") {
                            parentQ.question.answers.push({
                                permissibleValue: NativeRenderService.createRelativeText([match[3]], match[2], true),
                                nonValuelist: true,
                                subQuestions: [fe]
                            });
                            substituted = true;
                        } else {
                            answer = parentQ.question.answers.filter(function (a) {
                                return a.permissibleValue === match[3];
                            });
                            if (answer.length) answer = answer[0];
                            if (answer) {
                                if (!answer.subQuestions) answer.subQuestions = [];
                                answer.subQuestions.push(fe);
                                substituted = true;
                            }
                        }
                    } else {
                        if (!parentQ.question.answers) parentQ.question.answers = [];
                        let existingLogic = parentQ.question.answers.filter(function (el) {
                            return el.nonValuelist && el.subQuestions.length === 1 && el.subQuestions[0] === fe;
                        });
                        if (existingLogic.length > 0) {
                            let existingSubQ = existingLogic[0];
                            existingSubQ.permissibleValue = existingSubQ.permissibleValue + " or " +
                                NativeRenderService.createRelativeText([match[3]], match[2], false);
                        } else {
                            parentQ.question.answers.push({
                                permissibleValue: NativeRenderService.createRelativeText([match[3]], match[2], false),
                                nonValuelist: true,
                                subQuestions: [fe]
                            });
                        }
                        substituted = true;
                    }
                });
                if (substituted) {
                    form.formElements.splice(i, 1);
                    feSize--;
                    i--;
                    transformed = true;
                }
                prevQ.push(fe);
            } else {
                prevQ = [fe];
            }
            if (fe.elementType === "section" || fe.elementType === "form") {
                if (NativeRenderService.transformFormToInline(fe))
                    fe.forbidMatrix = true;
                if (fe.skipLogic) delete fe.skipLogic;
                continue;
            }
            // after transform processing of questions
            if (fe.question.uoms && fe.question.uoms.length === 1)
                fe.question.answerUom = fe.question.uoms[0];
            if (fe.skipLogic) delete fe.skipLogic;
        }
        return transformed;
    }

    static getShowIfQ(q, prevQ) {
        if (q.skipLogic && q.skipLogic.condition) {
            let strPieces = q.skipLogic.condition.split("\"");
            if (strPieces[0] === "") strPieces.shift();
            if (strPieces[strPieces.length - 1] === "") strPieces.pop();
            let accumulate = [];
            strPieces.forEach(function (e, i, strPieces) {
                let matchQ = prevQ.filter(function (q) {
                    return q.label === strPieces[i];
                });
                if (matchQ.length) {
                    let operator = strPieces[i + 1].trim();
                    let compValue = strPieces[i + 2];
                    let operatorWithNumber = operator.split(" ");
                    if (operatorWithNumber.length > 1) {
                        operator = operatorWithNumber[0];
                        compValue = operatorWithNumber[1];
                    }
                    accumulate.push([matchQ[0], strPieces[i], operator, compValue]);
                }
            });
            return accumulate;
        }
        return [];
    }

    static createRelativeText(v, oper, isValuelist) {
        let values = JSON.parse(JSON.stringify(v));
        values.forEach(function (e, i, a) {
            if (e === "") {
                if (isValuelist)
                    a[i] = "none";
                else
                    a[i] = "empty";
            }
        });
        switch (oper) {
            case "=":
                return values.join(" or ");
            case "!=":
                return "not " + values.join(" or ");
            case ">":
                return "more than " + NativeRenderService.min(values);
            case "<":
                return "less than " + NativeRenderService.max(values);
            case ">=":
                return NativeRenderService.min(values) + " or more";
            case "<=":
                return NativeRenderService.max(values) + " or less";
        }
    }

    static max(values) {
        return values.length > 0 && values[0].indexOf("/") > -1 ? values[0] : Math.max.apply(null, values);
    }

    static min(values) {
        return values.length > 0 && values[0].indexOf("/") > -1 ? values[0] : Math.max.apply(null, values);
    }

    static preprocessValueLists(formElements) {
        formElements.forEach(function (fe) {
            if (fe.elementType === "section" || fe.elementType === "form") {
                NativeRenderService.preprocessValueLists(fe.formElements);
                return;
            }
            if (fe.question && fe.question.answers) {
                let index = -1;
                fe.question.answers.forEach(function (v: any, i, a) {
                    if (NativeRenderService.hasOwnRow(v) || index === -1 && (i + 1 < a.length && NativeRenderService.hasOwnRow(a[i + 1]) || i + 1 === a.length))
                        v.index = index = -1;
                    else
                        v.index = ++index;
                    if (v.subQuestions)
                        NativeRenderService.preprocessValueLists(v.subQuestions);
                });
            }
        });
    }

    static hasOwnRow(e) {
        return !!e.subQuestions;
    }

    static flattenForm(formElements) {
        let last_id = 0;
        let result = [];
        let questions = [];
        flattenFormSection(formElements, []);
        return result;

        function createId() {
            return "q" + ++last_id;
        }

        function flattenFormSection(formElements, section) {
            formElements.forEach(function (fe) {
                flattenFormFe(fe, section.concat(fe.label));
            });
            flattenFormPushQuestions(section);
        }

        function flattenFormQuestion(fe, section) {
            fe.questionId = createId();
            let q: any;
            q = {
                "question": fe.label,
                "name": fe.questionId,
                "ids": fe.question.cde.ids,
                "tinyId": fe.question.cde.tinyId
            };
            if (fe.question.answerUom) q.answerUom = fe.question.answerUom;
            questions.push(q);
            fe.question.answers && fe.question.answers.forEach(function (a) {
                a.subQuestions && a.subQuestions.forEach(function (sq) {
                    flattenFormFe(sq, section);
                });
            });
        }

        function flattenFormFe(fe, section) {
            if (fe.elementType === "question") {
                flattenFormQuestion(fe, section);
            }
            if (fe.elementType === "section" || fe.elementType === "form") {
                flattenFormPushQuestions(section);
                flattenFormSection(fe.formElements, section);
            }
        }

        function flattenFormPushQuestions(section) {
            if (questions.length) {
                result.push({"section": section[section.length - 1], "questions": questions});
                questions = [];
            }
        }
    }
}