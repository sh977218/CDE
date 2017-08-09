import { Injectable } from "@angular/core";
import { CdeForm, DisplayProfile } from "../form.model";

@Injectable()
export class NativeRenderService {
    readonly SHOW_IF: string = "Dynamic";
    readonly FOLLOW_UP: string = "Follow-up";
    private errors: Array<string> = [];
    private overrideNativeRenderType: string = null;
    private currentNativeRenderType: string;

    profile: DisplayProfile;
    elt: CdeForm;
    form: CdeForm;
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
                _id: null,
                name: "Default Config",
                displayInstructions: true,
                displayNumbering: true,
                sectionsAsMatrix: true,
                displayValues: false,
                displayType: this.FOLLOW_UP,
                numberOfColumns: 4,
                displayInvisible: false,
                repeatFormat: "#."
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
    getErrors() {
        return this.errors;
    }

    getPvLabel(pv) {
        return pv ? (pv.valueMeaningName ? pv.valueMeaningName : pv.permissibleValue) : "";
    }

    getPvValue(pv) {
        return (pv && pv.permissibleValue !== pv.valueMeaningName ? pv.permissibleValue : "");
    }

    checkboxOnChange($event: any, model: any, value: any) {
        model = NativeRenderService.checkboxNullCheck(model);
        if ($event.target.checked)
            model.answer.push(value);
        else
            model.answer.splice(model.answer.indexOf(value), 1);
    }
    checkboxIsChecked(model: any, value: any) {
        model = NativeRenderService.checkboxNullCheck(model);
        return (model.answer.indexOf(value) !== -1);
    }
    static checkboxNullCheck(model: any) {
        if (!Array.isArray(model.answer))
            model.answer = [];
        return model;
    }

    static transformFormToInline(form) {
        let prevQ = [];
        let transformed = false;
        let feSize = (form.formElements ? form.formElements.length : 0);
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
        formElements && formElements.forEach(function (fe) {
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

    static flattenForm(elt) {
        let last_id = 0;
        let startSection = (elt.formElements && (elt.formElements.length > 1 || elt.formElements.length === 0) ? elt : elt.formElements[0]);
        return flattenFormSection(startSection, [startSection.label], "", "");

        function createId() {
            return "q" + ++last_id;
        }

        function flattenFormSection(fe, sectionHeading, sectionName, repeatNum) {
            function addSection(repeatSection, questions) {
                if (questions.length) {
                    repeatSection.push({
                        "section": sectionHeading[sectionHeading.length - 1] + repeatNum,
                        "questions": questions

                    });
                    questions = [];
                }
                return questions;
            }
            let repeats = NativeRenderService.getRepeatNumber(fe);
            let repeatSection = [];
            let questions = [];
            let output: any;
            for (let i = 0; i < repeats; i++) {
                if (repeats > 1)
                    repeatNum = " #" + i;
                fe.formElements.forEach( feIter => {
                    output = flattenFormFe(feIter, sectionHeading.concat(feIter.label), sectionName + (repeats > 1 ? i + "-" : ""), repeatNum);

                    if (output.length !== 0) {
                        if (typeof output[0].section !== "undefined" && typeof output[0].questions !== "undefined") {
                            questions = addSection(repeatSection, questions);
                            repeatSection = repeatSection.concat(output);
                        } else
                            questions = questions.concat(output);
                    }
                });
                questions = addSection(repeatSection, questions);
            }
            return repeatSection;
        }

        function flattenFormQuestion(fe, sectionHeading, sectionName, repeatNum) {
            let questions = [];
            if (!fe.questionId)
                fe.questionId = createId();
            let repeats = NativeRenderService.getRepeatNumber(fe);
            for (let i = 0; i < repeats; i++) {
                let q: any = {
                    "question": fe.label,
                    "name": sectionName + (repeats > 1 ? i + "-" : "") + fe.questionId,
                    "ids": fe.question.cde.ids,
                    "tinyId": fe.question.cde.tinyId
                };
                if (fe.question.answerUom) q.answerUom = fe.question.answerUom;
                questions.push(q);
            }
            fe.question.answers && fe.question.answers.forEach(function (a) {
                a.subQuestions && a.subQuestions.forEach(function (sq) {
                    questions = questions.concat(flattenFormFe(sq, sectionHeading, sectionName, repeatNum));
                });
            });
            return questions;
        }

        function flattenFormFe(fe, sectionHeading, sectionName, repeatNum) {
            if (fe.elementType === "question")
                return flattenFormQuestion(fe, sectionHeading, sectionName, repeatNum);
            if (fe.elementType === "section" || fe.elementType === "form")
                return flattenFormSection(fe, sectionHeading, sectionName, repeatNum);
        }
    }

    static getFirstQuestion(fe): any {
        let elem = fe;
        let firstQuestion = null;
        while (elem) {
            if (elem.elementType !== "question") {
                if (!elem.formElements && elem.formElements.length > 0)
                    break;
                elem = elem.formElements[0];
            } else {
                firstQuestion = elem;
                break;
            }
        }

        if (!firstQuestion || firstQuestion.question.datatype !== "Value List")
            throw fe.label + " First Question Value List is not available.";

        return firstQuestion;
    }

    static getRepeatNumber(fe) {
        if (fe.repeat) {
            if (fe.repeat[0] === "F") {
                let firstQ = NativeRenderService.getFirstQuestion(fe);
                if (firstQ && firstQ.question.answers)
                    return firstQ.question.answers.length;
                return 0;
            } else {
                let maxValue = parseInt(fe.repeat);
                return (maxValue >= 0 ? maxValue : 10);
            }
        }
        return 1;
    }
}
