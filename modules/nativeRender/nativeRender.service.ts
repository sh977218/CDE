import { Injectable } from '@angular/core';
import { isQuestion, repeatFe } from 'core/form/fe';
import { getShowIfQ } from 'core/form/skipLogic';
import { callbackify } from 'non-core/browser';
import { FormService } from 'nativeRender/form.service';
import { ScoreService } from 'nativeRender/score.service';
import { SkipLogicService } from 'nativeRender/skipLogic.service';
import { assertUnreachable, Cb1, CbErr, CdeId, CodeAndSystem } from 'shared/models.model';
import { pvGetDisplayValue, pvGetLabel } from 'core/de/deShared';
import {
    CdeForm, CdeFormFollow, CdeFormInputArray, DisplayProfile, DisplayType, FormElement, FormElementFollow,
    FormElementsFollowContainer,
    FormOrElement,
    FormQuestion, FormQuestionFollow, FormSection,
    FormSectionOrForm,
    PermissibleFormValue, question, Question, QuestionValue, QuestionValueList
} from 'shared/form/form.model';
import { addFormIds, iterateFeSync } from 'shared/form/fe';
import { SkipLogicOperators } from 'shared/form/skipLogic';

@Injectable()
export class NativeRenderService {
    get nativeRenderType(): DisplayType {
        return this._nativeRenderType;
    }
    set nativeRenderType(userType: DisplayType) {
        if (!this.profile) {
            this.profileSet();
        }
        if (!NativeRenderService.validateDisplayType(userType)) {
            userType = this.profile.displayType;
        }
        if (!this.nativeRenderType && NativeRenderService.validateDisplayType(userType)) {
            this._nativeRenderType = userType;
        }
        if (this.nativeRenderType !== userType && NativeRenderService.validateDisplayType(userType)) {
            if (this.elt) {
                this.render(userType);
            }
            this._nativeRenderType = userType;
            this.vm = this.nativeRenderType === NativeRenderService.SHOW_IF ? this.elt : this.followForm;
        }
    }
    private _nativeRenderType: DisplayType = 'Follow-up';
    elt!: CdeFormInputArray;
    private errors: string[] = [];
    followForm!: CdeFormFollow;
    flatMapping: any;
    locationDenied = false;
    profile!: DisplayProfile;
    questionChangeListeners: Cb1<FormQuestion>[] = [];
    submitForm?: boolean;
    vm!: CdeForm;

    constructor(public scoreSvc: ScoreService,
                public skipLogicService: SkipLogicService) {
    }

    addListener(cb: Cb1<FormQuestion>) {
        this.questionChangeListeners.push(cb); // no need to cleanup because the whole nrs goes out of scope
    }

    convert(formElement: FormQuestion) {
        const unit = formElement.question.answerUom;
        if (formElement.question.previousUom && unit && formElement.question.answer != null) {
            let value: number;
            if (typeof(formElement.question.answer) === 'string') {
                value = parseFloat(formElement.question.answer);
            } else {
                value = formElement.question.answer;
            }

            if (typeof(value) === 'number' && !isNaN(value)) {
                NativeRenderService.convertUnits(value, formElement.question.previousUom, unit, (error?: string, result?: number) => {
                    if (!error && result !== undefined && !isNaN(result) && unit === formElement.question.answerUom) {
                        formElement.question.answer = result;
                        this.emit(formElement);
                    }
                });
            }
        }
        formElement.question.previousUom = formElement.question.answerUom;
    }

    eltSet(elt: CdeForm) {
        if (elt !== this.elt) {
            this.elt = elt as CdeFormInputArray;
            this.scoreSvc.register(this.elt);
            this.questionChangeListeners.length = 0;
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

    emit(fe: FormQuestion) {
        this.scoreSvc.triggerCalculateScore(fe);
        this.questionChangeListeners.forEach(cb => cb(fe));
    }

    getAliases(f: FormQuestion) {
        if (this.profile) {
            f.question.uomsAlias = [];
            f.question.unitsOfMeasure.forEach(u => {
                const aliases = this.profile.unitsOfMeasureAlias.filter(a => CodeAndSystem.compare(a.unitOfMeasure, u));
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

    getCurrentGeoLocation(formElement: FormQuestion) {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                position => {
                    this.locationDenied = false;
                    if (formElement) {
                        formElement.question.answer = position.coords;
                        this.emit(formElement);
                    }
                },
                err => {
                    this.locationDenied = err.code === err.PERMISSION_DENIED;
                }
            );
        }
    }

    profileSet(profile?: DisplayProfile) {
        if (profile) {
            this.profile = profile;
        }
        if (!this.profile || this.elt && this.elt.displayProfiles && this.elt.displayProfiles.length > 0 &&
            this.elt.displayProfiles.indexOf(this.profile) === -1) {
            this.profile = this.elt.displayProfiles[0];
        }
        if (!this.profile) {
            this.profile = new DisplayProfile('Default Config');
        }
        iterateFeSync(this.elt, undefined, undefined, this.getAliases.bind(this));
    }

    radioButtonSelect(q: FormQuestion, value: string) {
        if (q.question.required || q.question.answer !== value) {
            q.question.answer = value;
        } else {
            q.question.answer = undefined;
        }
        this.emit(q);
    }

    render(renderType: DisplayType) {
        if (!this.elt) {
            return;
        }

        // Pre-Transform Processing
        iterateFeSync(this.elt, undefined, undefined, (f: FormQuestion) => {
            // clean up virtual follow answers
            const q = f as FormQuestionFollow;
            if (Array.isArray(q.question.answers)) {
                for (let i = 0; i < q.question.answers.length; i++) {
                    const answer = q.question.answers[i];
                    if (q.question.cde.permissibleValues && !q.question.cde.permissibleValues.some(
                        p => p.permissibleValue === answer.permissibleValue)) {
                        q.question.answers.splice(i--, 1);
                    } else {
                        if (answer.formElements) { answer.formElements = []; }
                        if (answer.index) { answer.index = undefined; }
                    }
                }
            }

            this.getAliases(f);

            // answers
            if (f.question.answer === undefined && f.question.defaultAnswer) {
                const defAns = f.question.defaultAnswer;
                switch (f.question.datatype) {
                    case 'Geo Location':
                        if (defAns) {
                            const inputs = defAns.split(',').map(value => parseFloat(value.trim()));
                            f.question.answer = {latitude: inputs[0], longitude: inputs[1]};
                        }
                        break;
                    case 'Number':
                        if (defAns) {
                            f.question.answer = parseFloat(defAns);
                        }
                        break;
                    case 'Value List':
                        f.question.answer = f.question.multiselect ? [f.question.defaultAnswer] : f.question.defaultAnswer;
                        break;
                    case 'Date':
                    case 'Dynamic Code List':
                    case 'Externally Defined':
                    case 'File':
                    case 'Text':
                    case 'Time':
                        f.question.answer = f.question.defaultAnswer;
                        break;
                    default:
                        throw assertUnreachable(f.question);
                }
            }
            if (f.question.unitsOfMeasure && f.question.unitsOfMeasure.length === 1) {
                f.question.answerUom = f.question.unitsOfMeasure[0];
            }
            if (f.question.datatype === 'Value List' && NativeRenderService.isPreselectedRadio(f)) {
                f.question.answer = f.question.answers[0].permissibleValue;
            }
        });

        addFormIds(this.elt);
        if (renderType === NativeRenderService.FOLLOW_UP) {
            this.followForm = NativeRenderService.cloneForm(this.elt) as CdeFormFollow;
            NativeRenderService.transformFormToInline(this.followForm);
            NativeRenderService.assignValueListRows(this.followForm.formElements);
        }
    }

    addError(msg: string) {
        if (this.errors.indexOf(msg) === -1) { this.errors.push(msg); }
    }

    getErrors() {
        return this.errors;
    }

    checkboxOnChange(checked: boolean, model: Question, value: any, q: FormQuestion) {
        if (!Array.isArray(model.answer)) { model.answer = []; }
        const index = model.answer.indexOf(value);
        if (checked) {
            if (index === -1) {
                model.answer.push(value);
            }
        } else {
            if (index > -1) {
                model.answer.splice(model.answer.indexOf(value), 1);
            }
        }
        this.emit(q);
    }

    checkboxIsChecked(model: Question, value: any) {
        if (!Array.isArray(model.answer)) { model.answer = []; }
        return (model.answer.indexOf(value) !== -1);
    }

    selectModel(q: FormQuestion) {
        if (q.question.datatype === 'Value List' && q.question.multiselect || q.question.answer === undefined) {
            return q.question.answer;
        } else {
            if (!Array.isArray(q.question.answerVM)) {
                q.question.answerVM = [];
            }
            q.question.answerVM.length = 0;
            q.question.answerVM.push(q.question.answer);
            return q.question.answerVM;
        }
    }

    selectModelChange(value: any, q: FormQuestion) {
        q.question.answer = q.question.datatype === 'Value List' && q.question.multiselect ? value : value[0];
        this.emit(q);
    }

    static readonly SHOW_IF: string = 'Dynamic';
    static readonly FOLLOW_UP: string = 'Follow-up';
    static readonly getPvDisplayValue = pvGetDisplayValue;
    static readonly getPvLabel = pvGetLabel;

    static answeredValueList(question: QuestionValueList) {
        return question.answer && (!question.multiselect || question.answer.length !== 0);
    }

    static answeredValueListAnswer(answer: QuestionValue, multiselect?: boolean) {
        return answer && (!multiselect || answer.length !== 0);
    }

    static convertUnits(value: number, fromUnit: CodeAndSystem, toUnit: CodeAndSystem, cb: CbErr<number>) {
        if (fromUnit.system === 'UCUM' && toUnit.system === 'UCUM') {
            callbackify(
                FormService.convertUnits(value, encodeURIComponent(fromUnit.code), encodeURIComponent(toUnit.code))
            )(cb);
        } else {
            cb(undefined, value); // no conversion for other systems
        }
    }

    static isPreselectedRadio(fe: FormQuestion) {
        return fe.question.datatype === 'Value List' && !fe.question.multiselect
            && (fe.question.answers || []).length === 1 && fe.question.required;
    }

    static cloneForm(form: CdeForm): CdeForm {
        const clone = JSON.parse(JSON.stringify(form));
        NativeRenderService.cloneFes(clone.formElements, form.formElements);
        return clone;
    }

    static cloneFes(newFes: FormElement[], oldFes: FormElement[]) {
        for (let i = 0, size = newFes.length; i < size; i++) {
            if (newFes[i].elementType === 'question') {
                (newFes[i] as FormQuestion).question = (oldFes[i] as FormQuestion).question;
            } else {
                NativeRenderService.cloneFes(newFes[i].formElements, oldFes[i].formElements);
            }
        }
    }

    static transformFormToInline(form: FormElementsFollowContainer): boolean {
        const followEligibleQuestions: FormElement[] = [];
        let transformed = false;
        let feSize = Array.isArray(form.formElements) ? form.formElements.length : 0;
        for (let i = 0; i < feSize; i++) {
            const fe = form.formElements[i];
            const qs = getShowIfQ(followEligibleQuestions, fe);
            if (qs.length > 0) {
                let substitution = 0;
                const parentQ: FormQuestionFollow = qs[0][0];
                qs.forEach(match => {
                    function getNotMappedSuffix() {
                        const value = substitution++;
                        return value ? '_fake' + value : '';
                    }

                    if (parentQ.question.datatype === 'Value List') {
                        if (!parentQ.question.answers) {
                            parentQ.question.answers = [];
                        }
                        if (match[3] === '') { // not answered, own line "is none"
                            parentQ.question.answers.push({
                                permissibleValue: NativeRenderService.createRelativeText([match[3]], match[2], true),
                                nonValuelist: true,
                                formElements: [Object.create(fe, {feId: {value: fe.feId + getNotMappedSuffix()}})]
                            });
                        } else {
                            const answer = parentQ.question.answers.filter(a => a.permissibleValue === match[3])[0];
                            if (answer) {
                                if (!answer.formElements) { answer.formElements = []; }
                                answer.formElements.push(Object.create(fe, {feId: {value: fe.feId + getNotMappedSuffix()}}));
                            }
                            // else non-existing value is ignored
                        }
                    } else {
                        if (!parentQ.question.answers) { parentQ.question.answers = []; }
                        const existingLogic = parentQ.question.answers.filter(
                            a => a.nonValuelist && a.formElements.length === 1 && a.formElements[0] === fe);
                        if (existingLogic.length > 0) {
                            // already substituted with relative text
                            const existingSubQ = existingLogic[0];
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
            if (fe.skipLogic) { fe.skipLogic = undefined; }
        }
        return transformed;
    }

    static createRelativeText(v: string[], oper: SkipLogicOperators, isValuelist: boolean): string {
        const values: string[] = JSON.parse(JSON.stringify(v));
        values.forEach((e, i, a) => {
            if (e === '') {
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
                throw assertUnreachable(oper);
        }
    }

    static max(values: any[]) {
        return values.length > 0 && values[0].indexOf('/') > -1 ? values[0] : Math.max.apply(null, values);
    }

    static min(values: any[]) {
        return values.length > 0 && values[0].indexOf('/') > -1 ? values[0] : Math.max.apply(null, values);
    }

    static assignValueListRows(formElements: FormElementFollow[]) {
        if (!formElements) {
            return;
        }
        formElements.forEach(fe => {
            switch (fe.elementType) {
                case 'form':
                case 'section':
                    return NativeRenderService.assignValueListRows(fe.formElements);
                case 'question':
                    if (fe.question.datatype === 'Value List' && fe.question.answers) {
                        let index = -1;
                        (fe.question.answers || []).forEach((pv: PermissibleFormValue, i, a: PermissibleFormValue[]) => {
                            if (NativeRenderService.hasOwnRow(pv) || index === -1 && (i + 1 < a.length
                                && NativeRenderService.hasOwnRow(a[i + 1]) || i + 1 === a.length)) {
                                pv.index = index = -1;
                            } else {
                                pv.index = ++index;
                            }

                            if (pv.formElements) { NativeRenderService.assignValueListRows(pv.formElements); }
                        });
                    }
                    break;
                default:
                    throw assertUnreachable(fe);
            }
        });
    }

    static hasOwnRow(e: PermissibleFormValue): boolean {
        return !!e.formElements;
    }

    static flattenForm(elt: CdeForm) {
        interface QuestionStruct {
            answerUom?: CodeAndSystem;
            ids: CdeId[];
            name: string;
            question: string;
            tinyId: string;
        }
        interface SectionQuestions {
            questions: QuestionStruct[];
            section: string;
        }

        function isSectionQuestions(a: SectionQuestions | QuestionStruct): a is SectionQuestions {
            return a.hasOwnProperty('section');
        }

        if (!elt.formElements || elt.formElements.length === 0) {
            return flattenFormSection(elt, [], '', '');
        } else {
            const startSection = elt.formElements[0] as FormSection;
            return flattenFormSection(startSection, [startSection.label || ''], '', '');
        }

        function flattenFormSection(fe: CdeForm | FormSectionOrForm, sectionHeading: string[], namePrefix: string,
                                    repeatNum: string): SectionQuestions[] {
            function addSection(repeatSection: SectionQuestions[], questions: QuestionStruct[]): QuestionStruct[] {
                if (questions.length) {
                    repeatSection.push({
                        section: sectionHeading[sectionHeading.length - 1] + repeatNum,
                        questions

                    });
                    questions = [];
                }
                return questions;
            }

            const repeats = NativeRenderService.getRepeatNumber(fe);
            let repeatSection: SectionQuestions[] = [];
            let questions: QuestionStruct[] = [];
            let output: SectionQuestions[] | QuestionStruct[];
            for (let i = 0; i < repeats; i++) {
                if (repeats > 1) { repeatNum = ' #' + i; }
                fe.formElements.forEach(feIter => {
                    output = flattenFormFe(feIter, sectionHeading.concat(feIter.label || ''),
                        namePrefix + (repeats > 1 ? i + '_' : ''), repeatNum);

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
            const repeats = NativeRenderService.getRepeatNumber(fe);
            for (let i = 0; i < repeats; i++) {
                const q: QuestionStruct = {
                    question: fe.label || '',
                    name: namePrefix + (repeats > 1 ? i + '_' : '') + fe.feId,
                    ids: fe.question.cde.ids,
                    tinyId: fe.question.cde.tinyId
                };
                if (fe.question.answerUom) {
                    q.answerUom = fe.question.answerUom;
                }
                questions.push(q);
            }
            if (fe.question.datatype === 'Value List' && fe.question.answers) {
                fe.question.answers.forEach(a => {
                    if (a.formElements) {
                        a.formElements.forEach((sq: FormElement) => {
                            questions = questions.concat(flattenFormFe(sq, sectionHeading, namePrefix, repeatNum) as QuestionStruct[]);
                        });
                    }
                });
            }
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
                    throw assertUnreachable(fe);
            }
        }
    }

    static getFirstQuestion(fe: FormElement | undefined): FormQuestion | undefined {
        let firstQuestion: FormQuestion | undefined;
        while (fe) {
            if (isQuestion(fe)) {
                firstQuestion = fe;
                break;
            } else {
                fe = fe.formElements && fe.formElements.length ? fe.formElements[0] : undefined;
            }
        }

        if (!firstQuestion || firstQuestion.question.datatype !== 'Value List') {
            return undefined;
        }
        return firstQuestion;
    }

    static getRepeatNumber(fe: FormOrElement): number {
        if (fe instanceof CdeForm) {
            return 1;
        }
        if (fe.repeat) {
            const repeat = repeatFe(fe);
            switch (repeat) {
                case '=':
                    // not statically analyzable
                    return 10;
                case 'F':
                    const firstQ = NativeRenderService.getFirstQuestion(fe);
                    if (firstQ && firstQ.question.datatype === 'Value List' && firstQ.question.answers) {
                        return firstQ.question.answers.length;
                    }
                    return 1;
                case 'N':
                    const repeatNumber = parseInt(fe.repeat, 10);
                    return repeatNumber >= 0 ? repeatNumber : 10;
                case '':
                    return 1;
                default:
                    throw assertUnreachable(repeat);
            }
        }
        return 1;
    }

    static setLatitude(fe: FormQuestion, value: number) {
        if (typeof(fe.question.answer) !== 'object') {
            fe.question.answer = {};
        }
        fe.question.answer.latitude = value;
    }

    static setLongitude(fe: FormQuestion, value: number) {
        if (typeof(fe.question.answer) !== 'object') {
            fe.question.answer = {};
        }
        fe.question.answer.longitude = value;
    }

    static validateDisplayType(displayType: string): boolean {
        return displayType === NativeRenderService.SHOW_IF || displayType === NativeRenderService.FOLLOW_UP;
    }
}
