import {
    FormElement, FormElementsContainer, FormInForm, FormQuestion, FormSection, Question, QuestionCde
} from 'shared/form/form.model';

declare function areDerivationRulesSatisfied(elt: FormElementsContainer): string[];
declare function findQuestionByTinyId(tinyId: string, elt: FormElementsContainer): FormQuestion;
declare function getFormQuestions(form: FormElementsContainer): FormQuestion[];
declare function getFormScoreQuestions(form: FormElementsContainer): FormQuestion[];
declare function getFormSkipLogicQuestions(form: FormElementsContainer): FormQuestion[];
declare function getFormQuestionsAsQuestion(form: FormElementsContainer): Question[];
declare function getFormQuestionsAsQuestionCde(form: FormElementsContainer): QuestionCde[];
declare function isInForm(fe: FormElement): fe is FormInForm;
declare function isQuestion(fe: FormElement): fe is FormQuestion;
declare function isSection(fe: FormElement): fe is FormSection;
declare function questionAnswered(q: FormQuestion): boolean;
declare function repeatFe(fe: FormElement): '' | '=' | 'F' | 'N';
declare function repeatFeLabel(fe: FormElement): string;
declare function repeatFeNumber(fe: FormElement): number;
declare function repeatFeQuestion(fe: FormElement): string;
