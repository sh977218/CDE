import { Injectable } from '@angular/core';

import { SkipLogicService } from 'nativeRender/skipLogic.service';
import { assertUnreachable, CdeId, CodeAndSystem } from 'shared/models.model';
import { pvGetDisplayValue, pvGetLabel } from 'shared/de/deShared';
import {
    CdeForm, DisplayProfile, FormElement, FormOrElement, FormQuestion, FormSection, FormSectionOrForm,
    PermissibleFormValue, Question
} from 'shared/form/form.model';
import { addFormIds, iterateFeSync } from 'shared/form/formShared';
import { getShowIfQ } from 'shared/form/skipLogic';
import { ScoreService } from 'nativeRender/score.service';

type SkipLogicOperators = '=' | '!=' | '>' | '<' | '>=' | '<=';


@Injectable()
export class NativeRenderService {
    static readonly SHOW_IF: string = 'Dynamic';
    static readonly FOLLOW_UP: string = 'Follow-up';
    static readonly getPvDisplayValue = pvGetDisplayValue;
    static readonly getPvLabel = pvGetLabel;
    private _nativeRenderType?: string;
    private _nativeRenderTypeOn?: boolean;
    elt: CdeForm;
    private errors: string[] = [];
    followForm: any;
    flatMapping: any;
    profile?: DisplayProfile;
    submitForm?: boolean;
    vm: any;

    constructor(private ss: ScoreService,
                public skipLogicService: SkipLogicService) {
    }

    eltSet(elt) {
        if (elt !== this.elt) {
            this.elt = elt;
            this.followForm = null;
            if (!this.elt.formInput) {
                this.elt.formInput = [];
            }
            if (this.nativeRenderType) {
                this.render(this.nativeRenderType);
                this.vm = this.nativeRenderType === NativeRenderService.SHOW_IF ? this.elt : this.followForm;
            }
        }
        if (this.submitForm && !this.flatMapping) {
            this.flatMapping = JSON.stringify({sections: NativeRenderService.flattenForm(this.elt)});
        }
    }

    getAliases(f: FormQuestion) {
        if (this.profile) {
            f.question.uomsAlias = [];
            f.question.unitsOfMeasure.forEach(u => {
                let aliases = this.profile.unitsOfMeasureAlias.filter(a => CodeAndSystem.compare(a.unitOfMeasure, u));
                if (aliases.length) {
                    f.question.uomsAlias.push(aliases[0].alias);
                } else {
                    f.question.uomsAlias.push(u.code);
                }
            });
        } else {
            f.question.uomsAlias = f.question.unitsOfMeasure.map(u => u.code);
        }
    }

    static isRadioOrCheckbox(fe: FormQuestion) { // returns true for radio and false for checkbox
        return !fe.question.multiselect && !(fe.question.answers.length === 1 && !fe.question.required);
    }

    static isPreselectedRadio(fe: FormQuestion) {
        return fe.question.answers.length === 1 && fe.question.required && !fe.question.multiselect;
    }

    get nativeRenderType() {
        return this._nativeRenderType;
    }

    set nativeRenderType(userType) {
        if (userType === 'default') {
            this._nativeRenderTypeOn = false;
            if (!this.profile) {
                this.profileSet();
            }
            userType = this.profile.displayType;
        }
        if (this.nativeRenderType !== userType
            && (userType === NativeRenderService.SHOW_IF || userType === NativeRenderService.FOLLOW_UP)) {
            if (this.elt) {
                this.render(userType);
            }
            this._nativeRenderType = userType;
            this.vm = this.nativeRenderType === NativeRenderService.SHOW_IF ? this.elt : this.followForm;
        }
    }

    profileSet(profile = null) {
        if (profile) {
            this.profile = profile;
        }
        if (this.elt && this.elt.displayProfiles && this.elt.displayProfiles.length > 0 &&
            this.elt.displayProfiles.indexOf(this.profile) === -1) {
            this.profile = this.elt.displayProfiles[0];
        }
        if (!this.profile) {
            this.profile = new DisplayProfile('Default Config');
        }
        iterateFeSync(this.elt, undefined, undefined, this.getAliases.bind(this));
        if (this._nativeRenderTypeOn === false) {
            this.nativeRenderType = this.profile.displayType;
        }
    }

    radioButtonSelect(q: FormQuestion, value: string) {
        if (q.question.required || q.question.answer !== value) {
            q.question.answer = value;
        } else {
            q.question.answer = undefined;
        }
        this.ss.triggerCalculateScore(q);
    }

    render(renderType) {
        if (!this.elt) {
            return;
        }

        // Pre-Transform Processing
        iterateFeSync(this.elt, undefined, undefined, (f: FormQuestion) => {
            // clean up
            if (Array.isArray(f.question.answers)) {
                for (let i = 0; i < f.question.answers.length; i++) {
                    let answer = f.question.answers[i];
                    if (!f.question.cde.permissibleValues.some(p => p.permissibleValue === answer.permissibleValue)) {
                        f.question.answers.splice(i--, 1);
                    }
                    else {
                        if (answer.formElements) answer.formElements = undefined;
                        if (answer.index) answer.index = undefined;
                    }
                }
            }

            this.getAliases(f);

            // answers
            if (f.question.unitsOfMeasure && f.question.unitsOfMeasure.length === 1) {
                f.question.answerUom = f.question.unitsOfMeasure[0];
            }
            if (NativeRenderService.isPreselectedRadio(f)) {
                f.question.answer = f.question.answers[0].permissibleValue;
            }
        });

        // assign name ids of format 'prefix_section#-section#-question#_suffix'
        addFormIds(this.elt);
        if (renderType === NativeRenderService.FOLLOW_UP) {
            this.followForm = NativeRenderService.cloneForm(this.elt);
            NativeRenderService.transformFormToInline(this.followForm);
            NativeRenderService.assignValueListRows(this.followForm.formElements);
        }
    }

    addError(msg: string) {
        if (this.errors.indexOf(msg) === -1) this.errors.push(msg);
    }

    hasErrors() {
        return !!this.errors.length;
    }

    getErrors() {
        return this.errors;
    }

    checkboxOnChange($event: any, model: Question, value: any, q) {
        if (!Array.isArray(model.answer)) model.answer = [];
        let index = model.answer.indexOf(value);
        if ($event.target.checked) {
            if (index === -1) {
                model.answer.push(value);
            }
        } else {
            if (index > -1) {
                model.answer.splice(model.answer.indexOf(value), 1);
            }
        }
        this.ss.triggerCalculateScore(q);
    }

    checkboxIsChecked(model: Question, value: any) {
        if (!Array.isArray(model.answer)) model.answer = [];
        return (model.answer.indexOf(value) !== -1);
    }

    selectModel(question: Question) {
        if (question.multiselect || question.answer === undefined) {
            return question.answer;
        } else {
            if (!Array.isArray(question.answerVM)) {
                question.answerVM = [];
            }
            question.answerVM.length = 0;
            question.answerVM.push(question.answer);
            return question.answerVM;
        }
    }

    selectModelChange($event: any, question: Question) {
        if (question.multiselect) {
            question.answer = $event;
        } else {
            if ($event.length) {
                question.answer = $event[0];
            }
        }
    }

    static cloneForm(form: CdeForm): CdeForm {
        let clone = JSON.parse(JSON.stringify(form));
        NativeRenderService.cloneFes(clone.formElements, form.formElements);
        return clone;
    }

    static cloneFes(newFes: FormElement[], oldFes: FormElement[]) {
        for (let i = 0, size = newFes.length; i < size; i++) {
            if (newFes[i].elementType === 'question') (newFes[i] as FormQuestion).question = (oldFes[i] as FormQuestion).question;
            else NativeRenderService.cloneFes(newFes[i].formElements, oldFes[i].formElements);
        }
    }

    static transformFormToInline(form: FormElement): boolean {
        let followEligibleQuestions = [];
        let transformed = false;
        let feSize = (form.formElements ? form.formElements.length : 0);
        for (let i = 0; i < feSize; i++) {
            let fe = form.formElements[i];
            let qs = getShowIfQ(followEligibleQuestions, fe);
            if (qs.length > 0) {
                let substitution = 0;
                let parentQ: FormQuestion = qs[0][0];
                qs.forEach(match => {
                    function getNotMappedSuffix() {
                        let value = substitution++;
                        return value ? '_fake' + value : '';
                    }

                    if (parentQ.question.datatype === 'Value List') {
                        if (match[3] === "") {
                            parentQ.question.answers.push({
                                permissibleValue: NativeRenderService.createRelativeText([match[3]], match[2], true),
                                nonValuelist: true,
                                formElements: [Object.create(fe, {feId: {value: fe.feId + getNotMappedSuffix()}})]
                            });
                        } else {
                            let answer = parentQ.question.answers.filter(a => a.permissibleValue === match[3])[0];
                            if (answer) {
                                if (!answer.formElements) answer.formElements = [];
                                answer.formElements.push(Object.create(fe, {feId: {value: fe.feId + getNotMappedSuffix()}}));
                            }
                        }
                    } else {
                        if (!parentQ.question.answers) parentQ.question.answers = [];
                        let existingLogic = parentQ.question.answers.filter(
                            a => a.nonValuelist && a.formElements.length === 1 && a.formElements[0] === fe);
                        if (existingLogic.length > 0) {
                            // already substituted with relative text
                            let existingSubQ = existingLogic[0];
                            existingSubQ.permissibleValue = existingSubQ.permissibleValue + ' or ' +
                                NativeRenderService.createRelativeText([match[3]], match[2], false);
                        } else {
                            parentQ.question.answers.push({
                                permissibleValue: NativeRenderService.createRelativeText([match[3]], match[2], false),
                                nonValuelist: true,
                                formElements: [Object.create(fe, {feId: {value: fe.feId + getNotMappedSuffix()}})],
                            });
                        }
                    }
                });
                if (substitution) {
                    form.formElements.splice(i, 1);
                    feSize--;
                    i--;
                    transformed = true;
                }
            } else {
                followEligibleQuestions.length = 0;
            }
            followEligibleQuestions.push(fe);

            // Post-Transform Processing
            if ((fe.elementType === 'section' || fe.elementType === 'form')
                && NativeRenderService.transformFormToInline(fe)) {
                (fe as FormSectionOrForm).forbidMatrix = true;
            }
            if (fe.skipLogic) fe.skipLogic = undefined;
        }
        return transformed;
    }

    static createRelativeText(v: string[], oper: SkipLogicOperators, isValuelist: boolean): string {
        let values: string[] = JSON.parse(JSON.stringify(v));
        values.forEach((e, i, a) => {
            if (e === "") {
                a[i] = isValuelist ? 'none' : 'empty';
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
            default:
                return assertUnreachable(oper);
        }
    }

    static max(values: string[]) {
        return values.length > 0 && values[0].indexOf('/') > -1 ? values[0] : Math.max.apply(null, values);
    }

    static min(values: string[]) {
        return values.length > 0 && values[0].indexOf('/') > -1 ? values[0] : Math.max.apply(null, values);
    }

    static assignValueListRows(formElements: FormElement[]) {
        formElements && formElements.forEach(fe => {
            switch (fe.elementType) {
                case 'form':
                case 'section':
                    return NativeRenderService.assignValueListRows(fe.formElements);
                case 'question':
                    if ((fe as FormQuestion).question && (fe as FormQuestion).question.answers) {
                        let index = -1;
                        (fe as FormQuestion).question.answers.forEach((pv: PermissibleFormValue, i, a) => {
                            if (NativeRenderService.hasOwnRow(pv) || index === -1 && (i + 1 < a.length
                                && NativeRenderService.hasOwnRow(a[i + 1]) || i + 1 === a.length)) {
                                pv.index = index = -1;
                            }
                            else pv.index = ++index;

                            if (pv.formElements) NativeRenderService.assignValueListRows(pv.formElements);
                        });
                    }
                    break;
                default:
                    return assertUnreachable(fe);
            }
        });
    }

    static hasOwnRow(e: PermissibleFormValue): boolean {
        return !!e.formElements;
    }

    static flattenForm(elt: CdeForm) {
        type QuestionStruct = { question: string, name: string, ids: CdeId[], tinyId: string, answerUom?: CodeAndSystem };
        type SectionQuestions = { section: string, questions: QuestionStruct[] };

        function isSectionQuestions(a: SectionQuestions | QuestionStruct): a is SectionQuestions {
            return a.hasOwnProperty('section');
        }

        if (!elt.formElements || elt.formElements.length === 0) {
            return flattenFormSection(elt, [], '', '');
        } else {
            let startSection = elt.formElements[0] as FormSection;
            return flattenFormSection(startSection, [startSection.label], '', '');
        }

        function flattenFormSection(fe: CdeForm | FormSectionOrForm, sectionHeading: string[], namePrefix: string, repeatNum: string): SectionQuestions[] {
            function addSection(repeatSection: SectionQuestions[], questions: QuestionStruct[]): QuestionStruct[] {
                if (questions.length) {
                    repeatSection.push({
                        section: sectionHeading[sectionHeading.length - 1] + repeatNum,
                        questions: questions

                    });
                    questions = [];
                }
                return questions;
            }

            let repeats = NativeRenderService.getRepeatNumber(fe);
            let repeatSection: SectionQuestions[] = [];
            let questions: QuestionStruct[] = [];
            let output: SectionQuestions[] | QuestionStruct[];
            for (let i = 0; i < repeats; i++) {
                if (repeats > 1) repeatNum = ' #' + i;
                fe.formElements.forEach(feIter => {
                    output = flattenFormFe(feIter, sectionHeading.concat(feIter.label), namePrefix + (repeats > 1 ? i + '_' : ''), repeatNum);

                    if (output.length !== 0) {
                        if (isSectionQuestions(output[0])) {
                            questions = addSection(repeatSection, questions);
                            repeatSection = repeatSection.concat(output as SectionQuestions[]);
                        } else {
                            questions = questions.concat(output as QuestionStruct[]);
                        }
                    }
                });
                questions = addSection(repeatSection, questions);
            }
            return repeatSection;
        }

        function flattenFormQuestion(fe: FormQuestion, sectionHeading: string[], namePrefix: string, repeatNum: string): QuestionStruct[] {
            let questions: QuestionStruct[] = [];
            let repeats = NativeRenderService.getRepeatNumber(fe);
            for (let i = 0; i < repeats; i++) {
                let q: QuestionStruct = {
                    question: fe.label,
                    name: namePrefix + (repeats > 1 ? i + '_' : '') + fe.feId,
                    ids: fe.question.cde.ids,
                    tinyId: fe.question.cde.tinyId
                };
                if (fe.question.answerUom) {
                    q.answerUom = fe.question.answerUom;
                }
                questions.push(q);
            }
            fe.question.answers && fe.question.answers.forEach(a => {
                a.formElements && a.formElements.forEach(sq => {
                    questions = questions.concat(flattenFormFe(sq, sectionHeading, namePrefix, repeatNum) as QuestionStruct[]);
                });
            });
            return questions;
        }

        function flattenFormFe(fe: FormElement, sectionHeading: string[], namePrefix: string, repeatNum: string) {
            switch (fe.elementType) {
                case 'form':
                case 'section':
                    return flattenFormSection(fe, sectionHeading, namePrefix, repeatNum);
                case 'question':
                    return flattenFormQuestion(fe, sectionHeading, namePrefix, repeatNum);
                default:
                    return assertUnreachable(fe);
            }
        }
    }

    static getFirstQuestion(fe: FormElement | null): any {
        let firstQuestion: FormQuestion | undefined;
        while (fe) {
            if (fe.elementType === 'question') {
                firstQuestion = fe;
                break;
            } else {
                fe = fe.formElements && fe.formElements.length ? fe.formElements[0] : null;
            }
        }

        if (!firstQuestion || firstQuestion.question.datatype !== 'Value List') return null;

        return firstQuestion;
    }

    static getRepeatNumber(fe: FormOrElement): number {
        if (fe instanceof CdeForm) {
            return 1;
        }
        if (fe.repeat) {
            if (fe.repeat[0] === 'F') {
                let firstQ = NativeRenderService.getFirstQuestion(fe);
                if (firstQ && firstQ.question.answers) return firstQ.question.answers.length;
                return 0;
            } else {
                let maxValue = parseInt(fe.repeat);
                return (maxValue >= 0 ? maxValue : 10);
            }
        }
        return 1;
    }

}
