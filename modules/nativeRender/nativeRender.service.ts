import { Injectable } from '@angular/core';
import {
    CdeForm, DisplayProfile, FormElement, FormQuestion, FormSection, FormSectionOrForm, PermissibleFormValue
} from 'core/form.model';
import { FormService } from 'nativeRender/form.service';
import { SkipLogicService } from 'nativeRender/skipLogic.service';

@Injectable()
export class NativeRenderService {
    static readonly SHOW_IF: string = 'Dynamic';
    static readonly FOLLOW_UP: string = 'Follow-up';
    private errors: string[] = [];
    private overrideNativeRenderType: string = null;
    private currentNativeRenderType: string;

    profile: DisplayProfile;
    elt: CdeForm;
    form: CdeForm;
    followForm: any;

    constructor(public skipLogicService: SkipLogicService) {}

    getNativeRenderType() {
        let newType = this.overrideNativeRenderType || (this.profile && this.profile.displayType);
        if (newType !== this.currentNativeRenderType)
            this.setNativeRenderType(newType);

        return newType;
    }

    render() {
        if (!this.elt)
            return;

        // clean up
        FormService.iterateFeSync(this.elt, undefined, undefined, f => {
            if (Array.isArray(f.question.anwers)) {
                for (let i = 0; i < f.question.answers.length; i++) {
                    let answer = f.question.answers[i];
                    if (!f.question.cde.permissibleValues.some(p => p.permissibleValue === answer.permissibleValue))
                        f.question.answers.splice(i--, 1);
                    else {
                        if (answer.formElements)
                            answer.formElements = undefined;
                        if (answer.index)
                            answer.index = undefined;
                    }
                }
            }
        });

        if (this.getNativeRenderType() === NativeRenderService.FOLLOW_UP) {
            this.followForm = NativeRenderService.cloneForm(this.elt);
            NativeRenderService.transformFormToInline(this.followForm);
            NativeRenderService.preprocessValueLists(this.followForm.formElements);
        }
    }

    setNativeRenderType(userType) {
        if (userType === this.profile.displayType)
            this.overrideNativeRenderType = null;
        else if (userType === NativeRenderService.SHOW_IF || userType === NativeRenderService.FOLLOW_UP)
            this.overrideNativeRenderType = userType;
        else
            return;

        this.currentNativeRenderType = userType;
        this.render();
    }
    setSelectedProfile(profile = null) {
        if (profile)
            this.profile = profile;
        if (this.elt && this.elt.displayProfiles && this.elt.displayProfiles.length > 0 &&
            this.elt.displayProfiles.indexOf(this.profile) === -1)
            this.profile = this.elt.displayProfiles[0];
        if (!this.profile)
            this.profile = new DisplayProfile("Default Config");

        this.setNativeRenderType(this.profile.displayType);
    }
    getElt() {
        switch (this.getNativeRenderType()) {
            case NativeRenderService.SHOW_IF:
                return this.elt;
            case NativeRenderService.FOLLOW_UP:
                return this.followForm;
        }
    }
    setElt(elt) {
        if (elt !== this.elt) {
            this.elt = elt;
            this.followForm = null;
            if (!this.elt.formInput)
                this.elt.formInput = [];

            let mapping = JSON.stringify({sections: NativeRenderService.flattenForm(this.elt)});
            this.render();
            return mapping;
        }

        return null;
    }

    addError(msg: string) {
        if (this.errors.indexOf(msg) === -1)
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

    static cloneForm(form: CdeForm): CdeForm {
        let clone = JSON.parse(JSON.stringify(form));
        NativeRenderService.cloneFes(clone.formElements, form.formElements);
        return clone;
    }

    static cloneFes(newFes: FormElement[], oldFes: FormElement[]) {
        for (let i = 0, size = newFes.length; i < size; i++) {
            if (newFes[i].elementType === 'question')
                (newFes[i] as FormQuestion).question = (oldFes[i] as FormQuestion).question;
            else
                NativeRenderService.cloneFes(newFes[i].formElements, oldFes[i].formElements);
        }
    }

    static transformFormToInline(form: FormElement): boolean {
        let transformed = false;
        let feSize = (form.formElements ? form.formElements.length : 0);
        for (let i = 0; i < feSize; i++) {
            let fe = form.formElements[i];
            let qs = SkipLogicService.getShowIfQ(form, fe);
            if (qs.length > 0) {
                let substituted = false;
                let parentQ = qs[0][0];
                qs.forEach(function (match) {
                    let answer;
                    if (parentQ.question.datatype === 'Value List') {
                        if (match[3] === "") {
                            parentQ.question.answers.push({
                                permissibleValue: NativeRenderService.createRelativeText([match[3]], match[2], true),
                                nonValuelist: true,
                                formElements: [fe]
                            });
                            substituted = true;
                        } else {
                            answer = parentQ.question.answers.filter(function (a) {
                                return a.permissibleValue === match[3];
                            });
                            if (answer.length) answer = answer[0];
                            if (answer) {
                                if (!answer.formElements) answer.formElements = [];
                                answer.formElements.push(fe);
                                substituted = true;
                            }
                        }
                    } else {
                        if (!parentQ.question.answers) parentQ.question.answers = [];
                        let existingLogic = parentQ.question.answers.filter(function (a) {
                            return a.nonValuelist && a.formElements.length === 1 && a.formElements[0] === fe;
                        });
                        if (existingLogic.length > 0) {
                            let existingSubQ = existingLogic[0];
                            existingSubQ.permissibleValue = existingSubQ.permissibleValue + ' or ' +
                                NativeRenderService.createRelativeText([match[3]], match[2], false);
                        } else {
                            parentQ.question.answers.push({
                                permissibleValue: NativeRenderService.createRelativeText([match[3]], match[2], false),
                                nonValuelist: true,
                                formElements: [fe]
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
            }

            // Post-Transform Processing
            if (fe.elementType === 'section' || fe.elementType === 'form') {
                if (NativeRenderService.transformFormToInline(fe))
                    (fe as FormSectionOrForm).forbidMatrix = true;
            } else {
                let feq = fe as FormQuestion;
                if (feq.question.uoms && feq.question.uoms.length === 1)
                    feq.question.answerUom = feq.question.uoms[0];
            }
            if (fe.skipLogic)
                fe.skipLogic = undefined;
        }
        return transformed;
    }

    static createRelativeText(v: string[], oper: string, isValuelist: boolean): string {
        let values = JSON.parse(JSON.stringify(v));
        values.forEach(function (e, i, a) {
            if (e === "") {
                if (isValuelist)
                    a[i] = 'none';
                else
                    a[i] = 'empty';
            }
        });
        switch (oper) {
            case '=':
                return values.join(' or ');
            case '!=':
                return 'not ' + values.join(' or ');
            case '>':
                return 'more than ' + NativeRenderService.min(values);
            case '<':
                return 'less than ' + NativeRenderService.max(values);
            case '>=':
                return NativeRenderService.min(values) + ' or more';
            case '<=':
                return NativeRenderService.max(values) + ' or less';
        }
    }

    static max(values) {
        return values.length > 0 && values[0].indexOf('/') > -1 ? values[0] : Math.max.apply(null, values);
    }

    static min(values) {
        return values.length > 0 && values[0].indexOf('/') > -1 ? values[0] : Math.max.apply(null, values);
    }

    static preprocessValueLists(formElements: FormElement[]) {
        formElements && formElements.forEach(function (fe) {
            if (fe.elementType === 'section' || fe.elementType === 'form') {
                NativeRenderService.preprocessValueLists(fe.formElements);
                return;
            }
            if ((fe as FormQuestion).question && (fe as FormQuestion).question.answers) {
                let index = -1;
                (fe as FormQuestion).question.answers.forEach(function (pv: PermissibleFormValue, i, a) {
                    if (NativeRenderService.hasOwnRow(pv) || index === -1 && (i + 1 < a.length
                            && NativeRenderService.hasOwnRow(a[i + 1]) || i + 1 === a.length))
                        pv.index = index = -1;
                    else
                        pv.index = ++index;

                    if (pv.formElements)
                        NativeRenderService.preprocessValueLists(pv.formElements);
                });
            }
        });
    }

    static hasOwnRow(e) {
        return !!e.formElements;
    }

    static flattenForm(elt) {
        let last_id = 0;
        let startSection = (elt.formElements && (elt.formElements.length > 1 || elt.formElements.length === 0) ? elt : elt.formElements[0]);
        return flattenFormSection(startSection, [startSection.label], "", "");

        function createId() {
            return 'q' + ++last_id;
        }

        function flattenFormSection(fe, sectionHeading, sectionName, repeatNum) {
            function addSection(repeatSection, questions) {
                if (questions.length) {
                    repeatSection.push({
                        'section': sectionHeading[sectionHeading.length - 1] + repeatNum,
                        'questions': questions

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
                    repeatNum = ' #' + i;
                fe.formElements.forEach( feIter => {
                    output = flattenFormFe(feIter, sectionHeading.concat(feIter.label), sectionName + (repeats > 1 ? i + '-' : ""), repeatNum);

                    if (output.length !== 0) {
                        if (typeof output[0].section !== 'undefined' && typeof output[0].questions !== 'undefined') {
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
                    'question': fe.label,
                    'name': sectionName + (repeats > 1 ? i + '-' : "") + fe.questionId,
                    'ids': fe.question.cde.ids,
                    'tinyId': fe.question.cde.tinyId
                };
                if (fe.question.answerUom) q.answerUom = fe.question.answerUom;
                questions.push(q);
            }
            fe.question.answers && fe.question.answers.forEach(function (a) {
                a.formElements && a.formElements.forEach(function (sq) {
                    questions = questions.concat(flattenFormFe(sq, sectionHeading, sectionName, repeatNum));
                });
            });
            return questions;
        }

        function flattenFormFe(fe, sectionHeading, sectionName, repeatNum) {
            if (fe.elementType === 'question')
                return flattenFormQuestion(fe, sectionHeading, sectionName, repeatNum);
            if (fe.elementType === 'section' || fe.elementType === 'form')
                return flattenFormSection(fe, sectionHeading, sectionName, repeatNum);
        }
    }

    static getFirstQuestion(fe): any {
        let firstQuestion: FormQuestion;
        while (fe) {
            if (fe.elementType !== 'question') {
                if (!fe.formElements && fe.formElements.length > 0)
                    break;
                fe = fe.formElements[0];
            } else {
                firstQuestion = fe;
                break;
            }
        }

        if (!firstQuestion || firstQuestion.question.datatype !== 'Value List')
            return null;

        return firstQuestion;
    }

    static getRepeatNumber(fe: FormElement): number {
        if (fe.repeat) {
            if (fe.repeat[0] === 'F') {
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
