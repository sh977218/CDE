import { Injectable } from '@angular/core';
import _trim from 'lodash/trim';
import { FormElement, FormElementsContainer, SkipLogic } from 'shared/form/form.model';
import {
    getLabel, getQuestionPriorByLabel, getQuestionsPrior, tokenSanitizer, tokenSplitter
} from 'shared/form/skipLogic';

@Injectable()
export class SkipLogicValidateService {
    previousSkipLogicPriorToSelect = '';
    optionsMap: Map<string, string> = new Map;

    static checkAndUpdateLabel(section, oldLabel, newLabel = undefined) {
        let result = false;
        section.formElements.forEach((fe) => {
            if (fe.skipLogic && fe.skipLogic.condition) {
                let updateSkipLogic = false;
                let tokens = tokenSplitter(fe.skipLogic.condition);
                tokens.forEach((token, i) => {
                    if (i % 4 === 0 && token === '"' + oldLabel + '"') {
                        updateSkipLogic = true;
                        result = true;
                        if (newLabel) tokens[i] = '"' + newLabel + '"';
                    }
                });
                if (newLabel && updateSkipLogic) {
                    fe.skipLogic.condition = tokens.join(' ');
                    fe.updatedSkipLogic = true;
                }
            }
        });
        return result;
    }

    getTypeaheadOptions(currentContent, parent: FormElementsContainer, fe: FormElement): string[] {
        if (!currentContent) currentContent = '';
        if (!fe.skipLogic) fe.skipLogic = new SkipLogic();

        let tokens = tokenSplitter(currentContent);
        this.previousSkipLogicPriorToSelect = currentContent.substr(0, currentContent.length - tokens.unmatched.length);

        this.optionsMap.clear();
        let options: string[];
        if (tokens.length % 4 === 0) {
            options = getQuestionsPrior(parent, fe)
                .filter(q => q.question.datatype !== 'Value List' || q.question.answers && q.question.answers.length > 0)
                .map(q => '"' + getLabel(q) + '" ');
        } else if (tokens.length % 4 === 1) {
            options = ['= ', '< ', '> ', '>= ', '<= ', '!= '];
        } else if (tokens.length % 4 === 2) {
            options = this.getTypeaheadOptionsAnswer(parent, fe, tokens[tokens.length - 2]);
        } else if (tokens.length % 4 === 3) {
            options = ['AND ', 'OR '];
        }

        if (!options) options = [];
        let optionsFiltered = options.filter(o => o.toLowerCase().indexOf(tokens.unmatched.toLowerCase()) > -1);
        if (optionsFiltered.length > 0) options = optionsFiltered;
        return options;
    }

    getTypeaheadOptionsAnswer(parent: FormElementsContainer, fe: FormElement, questionName: string): string[] {
        let q = getQuestionPriorByLabel(parent, fe, questionName.substring(1, questionName.length - 1));
        if (!q) return [];

        if (q.question.datatype === 'Value List') {
            if (!q.question.answers) return [];
            else {
                return q.question.answers.map(a => {
                    let pv = tokenSanitizer(a.permissibleValue);
                    let pvString = `"${pv}" `;
                    let nameString = a.valueMeaningName !== a.permissibleValue
                        ? `"${pv}" - ${tokenSanitizer(a.valueMeaningName)}` : pvString;
                    this.optionsMap.set(nameString, pvString);
                    return nameString;
                });
            }
        }
        if (q.question.datatype === 'Number') {
            return ['{{' + q.question.datatype + '}}'];
        }
        if (q.question.datatype === 'Date') {
            return ['"{{MM/DD/YYYY}}"'];
        }
        return [];
    }

    typeaheadSkipLogic(parent: FormElementsContainer, fe: FormElement, event): boolean {
        let skipLogic = fe.skipLogic;
        skipLogic.validationError = undefined;
        if (event && event.item) {
            skipLogic.condition = this.previousSkipLogicPriorToSelect
                + (this.optionsMap.size ? this.optionsMap.get(event.item) : event.item);
        } else {
            skipLogic.condition = event;
        }

        return SkipLogicValidateService.validateSkipLogic(parent, fe);
    }

    static validateSkipLogic(parent: FormElementsContainer, fe: FormElement): boolean {
        // skip logic object should exist
        let skipLogic = fe.skipLogic;
        let tokens = tokenSplitter(skipLogic.condition);
        if (tokens.unmatched) {
            skipLogic.validationError = 'Unexpected token: ' + tokens.unmatched;
            return false;
        }
        if (tokens.length === 0) return true;
        if (tokens.length % 4 !== 3) {
            skipLogic.validationError = 'Unexpected number of tokens in expression ' + tokens.length;
            return false;
        }
        let err = this.validateSkipLogicSingleExpression(parent, fe, tokens.slice(0, 3));
        if (err) {
            skipLogic.validationError = err;
            return false;
        }
        return true;
    }

    static validateSkipLogicSingleExpression(parent: FormElementsContainer, fe: FormElement, tokens): string {
        let filteredQuestion = getQuestionPriorByLabel(parent, fe, _trim(tokens[0], '"'));
        if (!filteredQuestion) {
            return tokens[0] + ' is not a valid question label';
        }

        switch (filteredQuestion.question.datatype) {
            case 'Value List':
                if (tokens[2].length > 0 && filteredQuestion.question.answers.map(a => '"' +
                    tokenSanitizer(a.permissibleValue) + '"').indexOf(tokens[2]) < 0) {
                    return tokens[2] + ' is not a valid answer for "' + filteredQuestion.label + '"';
                }
                break;
            case 'Number':
                if (isNaN(tokens[2])) {
                    return tokens[2] + ' is not a valid number for "' + filteredQuestion.label + '". Replace '
                        + tokens[2] + ' with a valid number.';
                }
                if (filteredQuestion.question.datatypeNumber) {
                    let answerNumber = parseInt(tokens[2]);
                    let max = filteredQuestion.question.datatypeNumber.maxValue;
                    let min = filteredQuestion.question.datatypeNumber.minValue;
                    if (min !== undefined && answerNumber < min) {
                        return tokens[2] + ' is less than a minimal answer for "' + filteredQuestion.label + '"';
                    }
                    if (max !== undefined && answerNumber > max) {
                        return tokens[2] + ' is bigger than a maximal answer for "' + filteredQuestion.label + '"';
                    }
                }
                break;
            case 'Date':
                if (tokens[2].length > 0 && new Date(tokens[2]).toString() === 'Invalid Date') {
                    return tokens[2] + ' is not a valid date for "' + filteredQuestion.label + '".';
                }
                break;
        }
        return null;
    }
}