import { FormElement, FormElementsContainer, FormQuestion } from 'shared/form/form.model';
import { NativeRenderService } from 'nativeRender/nativeRender.service';

type filter = (fe: FormElement) => boolean;

declare function evaluateSkipLogic(condition: string, parent: FormElementsContainer, fe: FormElement, nrs: NativeRenderService): boolean;
declare function getLabel(q: FormQuestion): string;
declare function getQuestions(fes: FormElement[], filter?: filter): FormQuestion[];
declare function getQuestionsPrior(parent: FormElementsContainer, fe: FormElement, filter?: filter): FormQuestion[];
declare function getQuestionPriorByLabel(parent: FormElementsContainer, fe: FormElement, label: string): FormQuestion;
declare function getShowIfQ(fes: FormElement[], fe: FormElement): any[];
declare function tokenSanitizer(label: string): string;
declare function tokenSplitter(str: string): any;
