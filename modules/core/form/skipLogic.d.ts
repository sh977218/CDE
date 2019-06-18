import { FormElement, FormQuestion } from 'shared/form/form.model';
import { Cb1 } from 'shared/models.model';

declare const SkipLogicOperatorsArray: string[];

declare function evaluateSkipLogic(condition: string | undefined, parent: FormElement, fe: FormElement, addError: Cb1<string>): boolean;
declare function getQuestionByLabel(fes: FormElement[], label: string): FormQuestion;
declare function getShowIfQ(fes: FormElement[], fe: FormElement): any[];
declare function tokenSanitizer(label: string): string;