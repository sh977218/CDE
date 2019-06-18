import { FormElement, FormElementsContainer, FormQuestion } from 'shared/form/form.model';

type filter = (fe: FormElement) => boolean;
type SkipLogicOperators = '=' | '!=' | '>' | '<' | '>=' | '<=';

declare function getLabel(q: FormQuestion): string;
declare function getQuestions(fes: FormElement[], filter?: filter): FormQuestion[];
declare function getQuestionsPrior(parent: FormElementsContainer, fe: FormElement, filter?: filter, topFe?: FormElementsContainer): FormQuestion[]; // search all tree prior
declare function getQuestionPriorByLabel(parent: FormElementsContainer, fe: FormElement, label: string, topFe?: FormElementsContainer): FormQuestion;
declare function tokenSplitter(str: string): any;
