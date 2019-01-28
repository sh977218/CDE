import { FormElement, FormElementsContainer, FormQuestion } from 'shared/form/form.model';
import { Cb1 } from 'shared/models.model';

type filter = (fe: FormElement) => boolean;
type SkipLogicOperators = '=' | '!=' | '>' | '<' | '>=' | '<=';

declare const SkipLogicOperatorsArray: string[];

declare function evaluateSkipLogic(condition: string | undefined, parent: FormElement, fe: FormElement, addError: Cb1<string>): boolean;
declare function getLabel(q: FormQuestion): string;
declare function getQuestions(fes: FormElement[], filter?: filter): FormQuestion[];
declare function getQuestionsPrior(parent: FormElementsContainer, fe: FormElement, filter?: filter): FormQuestion[];
declare function getQuestionPriorByLabel(parent: FormElementsContainer, fe: FormElement, label: string): FormQuestion;
declare function getShowIfQ(fes: FormElement[], fe: FormElement): any[];
declare function tokenSanitizer(label: string): string;
declare function tokenSplitter(str: string): any;
