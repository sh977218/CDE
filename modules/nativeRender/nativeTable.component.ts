import { Component, Input } from '@angular/core';
import { NativeRenderService } from 'nativeRender/nativeRender.service';
import { pvGetLabel } from 'core/de/deShared';
import { isInForm, isQuestion, isSection, repeatFe, repeatFeQuestion } from 'core/form/fe';
import { FormElement, FormQuestion, FormSectionOrForm } from 'shared/form/form.model';
import { iterateFeSync, questionMulti } from 'shared/form/fe';
import { getQuestionPriorByLabel } from 'shared/form/skipLogic';
import { assertUnreachable } from 'shared/models.model';
import { range } from 'shared/system/util';

interface Style {backgroundColor?: string;}
interface Theme {
    sectionStyle: Style;
    questionStyle: Style;
    answerStyle: Style;
}
interface HeadQuestionType {header?: boolean; label?: string; rspan?: number; cspan?: number; style?: Style;}
interface HeadType {q: HeadQuestionType[];}
interface BodyType {name?: string; fe?: FormQuestion; type: 'date' | 'label' | 'geo' | 'list' | 'mlist' | 'number' | 'text'; style: Style;}
interface RowType {label: string;}

@Component({
    selector: 'cde-native-table',
    templateUrl: './nativeTable.component.html'
})
export class NativeTableComponent {
    @Input() set formElement(fe: FormSectionOrForm) {
        this._formElement = fe;
        this.questionsWithAnswersRepeated.clear();
        const listenOnQuestionAnswers = (f: FormElement) => {
            if (repeatFe(f) === '=') {
                const label = repeatFeQuestion(f);
                const q = getQuestionPriorByLabel(f, f, label, this.nrs.vm);
                if (!q) {
                    return;
                }
                if (!this.questionsWithAnswersRepeated.size) {
                    this.nrs.addListener((f: FormQuestion) => {
                        if (this.questionsWithAnswersRepeated.has(f)) {
                            this.render();
                        }
                    });
                }
                this.questionsWithAnswersRepeated.add(q);
            }
        };
        listenOnQuestionAnswers(fe);
        iterateFeSync(fe, listenOnQuestionAnswers, listenOnQuestionAnswers, listenOnQuestionAnswers, fe);
        this.render();
    }
    get formElement() {
        return this._formElement;
    }

    constructor(public nrs: NativeRenderService) {
    }
    _formElement!: FormSectionOrForm;
    canRender = false;
    firstQuestion?: FormQuestion;
    numberingFormat?: string;
    questionsWithAnswersRepeated: Set<FormQuestion> = new Set();
    sectionNumber?: number;
    tableForm!: {
        head: HeadType[], // heading, with index=level=row num of heading (go in between colspans from above), q is column
        body: BodyType[], // matching q columns which are questions
        rows: RowType[]
    };
    readonly NRS = NativeRenderService;
    datePrecisionToType = FormQuestion.datePrecisionToType;
    datePrecisionToStep = FormQuestion.datePrecisionToStep;

    theme: Theme[] = [
        {
            sectionStyle: {backgroundColor: '#d7f3da'},
            questionStyle: {backgroundColor: '#d7f3da'},
            answerStyle: {backgroundColor: '#f6fff9'}
        },
        {
            sectionStyle: {backgroundColor: '#dad7f3'},
            questionStyle: {backgroundColor: '#dad7f3'},
            answerStyle: {backgroundColor: '#f9f6ff'}
        },
        {
            sectionStyle: {backgroundColor: '#f3dad7'},
            questionStyle: {backgroundColor: '#f3dad7'},
            answerStyle: {backgroundColor: '#fff9f6'}
        },
        {
            sectionStyle: {backgroundColor: '#f1f3d8'},
            questionStyle: {backgroundColor: '#f1f3d8'},
            answerStyle: {backgroundColor: '#fcfff5'}
        },
        {
            sectionStyle: {backgroundColor: '#d8f1f3'},
            questionStyle: {backgroundColor: '#d8f1f3'},
            answerStyle: {backgroundColor: '#f5fcff'}
        },
        {
            sectionStyle: {backgroundColor: '#f3d8f1'},
            questionStyle: {backgroundColor: '#f3d8f1'},
            answerStyle: {backgroundColor: '#fff5fc'}
        },
    ];

    static getQuestionType(fe: FormQuestion) {
        switch (fe.question.datatype) {
            case 'Value List':
                return questionMulti(fe) ? 'mlist' : 'list';
            case 'Date':
                return 'date';
            case 'Geo Location':
                return 'geo';
            case 'Number':
                return 'number';
            default:
                return 'text';
        }
    }

    radioButtonSelect(required: boolean, obj: any, property: string, value: string, q: FormQuestion) {
        if (required || obj[property] !== value) {
            obj[property] = value;
        } else {
            obj[property] = undefined;
        }
        this.nrs.emit(q);
    }

    render() {
        this.tableForm = {
            head: [{q: []}],
            body: [],
            rows: []
        };
        this.sectionNumber = 0;
        if (!this.formElement.repeat) {
            throw new Error('Not a table');
        }

        // create first column
        const head: HeadQuestionType = this.tableForm.head[0].q[0] = {cspan: 1, style: {backgroundColor: '#ddd'}};
        const body: BodyType = this.tableForm.body[0] = {type: 'label', style: {backgroundColor: '#f2f2f2'}};

        this.tableForm.rows = this.getRows(this.formElement, head, body).map(r => ({label: r}));
        if (!this.tableForm.rows.length) {
            this.canRender = false;
            return;
        }
        this.canRender = true;

        const [r, c] = this.renderFormElement(this.formElement, -1, undefined, undefined, undefined, undefined);
        this.setDepth(r + 1);
        head.rspan = r + 1;
    }

    repeatFormat() {
        if (this.numberingFormat) {
            return this.numberingFormat;
        }
        this.numberingFormat = !this.nrs.profile && '#.' || this.nrs.profile && this.nrs.profile.repeatFormat || '';
        return this.numberingFormat;
    }

    repeatList(f: FormElement, level: number, name: string): string[] {
        const numberList = (repeatNumber: number = 1) => {
            return repeatNumber > 1
                ? range(repeatNumber).map(i => this.repeatFormat().replace(/#/, (i + 1).toString()))
                : new Array(repeatNumber || 0).fill('');
        };

        if (level === 0) {
            return [''];
        }
        const repeat = repeatFe(f);
        switch (repeat) {
            case '=':
                const refQuestion = getQuestionPriorByLabel(f, f, repeatFeQuestion(f), this.nrs.vm);
                if (!refQuestion) {
                    return ['']; // bad state, treat as no repeat
                }
                const repeatNumber = parseInt(refQuestion.question.answer);
                return numberList(repeatNumber > 0 ? repeatNumber : 1);
            case 'F':
                const firstQ = NativeRenderService.getFirstQuestion(f);
                if (!firstQ) {
                    return ['']; // bad state, treat as no repeat
                }
                const answers = firstQ.question.answers || [];
                const hasIndex = answers.length > 1;
                answers.forEach((a, i) => {
                    this.tableForm.rows.forEach((r, ri) => {
                        this.nrs.elt.formInput![ri + name + (hasIndex ? '_' + i : '') + '_' + firstQ!.feId] = a.permissibleValue;
                    });
                });
                return answers.map(pvGetLabel);
            case 'N':
                return numberList(parseInt(f.repeat!));
            case '':
                return [''];
            default:
                throw assertUnreachable(repeat);
        }
    }

    getRows(f: FormElement, head: HeadQuestionType, body: BodyType): string[] {
        const numberList = (repeatNumber: number = 1) => {
            return repeatNumber > 1
                ? range(repeatNumber).map(i => this.repeatFormat().replace(/#/, (i + 1).toString()))
                : new Array(repeatNumber).fill('');
        };

        const repeat = repeatFe(f);
        switch (repeat) {
            case '=':
                const refQuestion = getQuestionPriorByLabel(f, f, repeatFeQuestion(f), this.nrs.vm);
                if (!refQuestion) {
                    return ['']; // bad state, treat as no repeat
                }
                const repeatNumber = parseInt(refQuestion.question.answer);
                return numberList(repeatNumber > 0 ? repeatNumber : 1);
            case 'F':
                this.firstQuestion = NativeRenderService.getFirstQuestion(f);
                if (!this.firstQuestion) {
                    return ['']; // bad state, treat as no repeat
                }

                head.label = this.firstQuestion.label;
                body.name = '_' + this.firstQuestion.feId;
                body.fe = this.firstQuestion;
                return (this.firstQuestion.question.answers || []).map((a, i) => {
                    this.nrs.elt.formInput![i + '_' + this.firstQuestion!.feId] = a.permissibleValue;
                    return NativeRenderService.getPvLabel(a);
                });
            case 'N':
                return numberList(parseInt(f.repeat!));
            case '':
                return [''];
            default:
                throw assertUnreachable(repeat);
        }
    }

    renderFormElement(f: FormElement, level: number, r: number = 1, c: number = 0, sectionStyle?: Theme, name = '') {
        const firstIndex = repeatFe(f) === 'F' ? 1 : 0;
        if (isSection(f) || isInForm(f)) {
            level += 1;
            const list = this.repeatList(f, level, name);
            [r, c] = list.reduce((acc, label, iN) => {
                let iR = 1, iC = 0;
                // create
                const sectionStyle = this.getSectionStyle(this.sectionNumber!++);
                const section = {
                    header: true,
                    cspan: iC,
                    label: label + (f.label ? ' ' + f.label : ''),
                    style: sectionStyle.sectionStyle
                };
                this.getSectionLevel(level).q.push(section);

                // iterate
                iR += f.formElements && f.formElements.reduce((acc, fe: FormElement, i: number) => {
                    if (i < firstIndex) {
                        return acc;
                    }
                    let secR;
                    [secR, iC] = this.renderFormElement(fe, level, iR, iC, sectionStyle, name + (list.length > 1 ? '_' + iN : ''));
                    return Math.max(acc, secR);
                }, 0);
                section.cspan = iC;

                return [Math.max(acc[0], iR), acc[1] + iC];
            }, [r, c]);
        } else if (isQuestion(f)) {
            c++;
            const list = this.repeatList(f, level, name);
            [r, c] = list.reduce((acc, label, i) => {
                const questionName = name + (list.length > 1 ? '_' + i : '') + '_' + f.feId;

                // create
                this.getSectionLevel(level + 1).q.push({rspan: r, label: f.label, style: sectionStyle!.questionStyle});
                this.tableForm.body.push({
                    type: NativeTableComponent.getQuestionType(f),
                    name: questionName,
                    fe: f,
                    style: sectionStyle!.answerStyle
                });

                // pre-populate question values
                if (f.question.datatype === 'Value List' && questionMulti(f)) {
                    this.tableForm.rows.forEach((r, i) => {
                        const location = i + questionName;
                        this.nrs.elt.formInput![location] = [];
                        this.nrs.elt.formInput![location].answer = this.nrs.elt.formInput![location];
                    });
                }
                if (f.question.datatype === 'Value List' && NativeRenderService.isPreselectedRadio(f)) {
                    this.tableForm.rows.forEach((r, i) => {
                        const location = i + questionName;
                        this.nrs.elt.formInput![location] = f.question.answers![0].permissibleValue;
                    });
                }
                if (f.question.unitsOfMeasure && f.question.unitsOfMeasure.length === 1) {
                    this.tableForm.rows.forEach((r, i) => {
                        const location = i + questionName;
                        this.nrs.elt.formInput![location + '_uom'] = f.question.unitsOfMeasure[0];
                    });
                }

                // iterate
                (f.question.answers || []).forEach(a => {
                    a.formElements && a.formElements.forEach(sf => {
                        [r, c] = this.renderFormElement(sf, level, r, c, sectionStyle, name + (list.length > 1 ? '_' + i : ''));
                    });
                });

                return [r, c];
            }, [r, c]);
        }
        return [r, c];
    }

    setDepth(r: number) {
        this.tableForm.head.forEach((s, level: number) => {
            s.q.forEach(q => {
                if (!q.header) { q.rspan = r - level; }
            });
        });
    }

    getSectionLevel(level: number) {
        if (this.tableForm.head.length <= level) { this.tableForm.head[level] = {q: []}; }
        return this.tableForm.head[level];
    }

    getSectionStyle(i: number) {
        return this.theme[i % this.theme.length];
    }
}
