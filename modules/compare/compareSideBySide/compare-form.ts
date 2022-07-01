import { CdeForm } from 'shared/form/form.model';
import { CompareQuestion } from 'compare/compareSideBySide/compare-question';

export type CompareForm = CdeForm & { questions: CompareQuestion[] };
