import { CdeForm, FormElement, FormOrElement } from 'shared/form/form.model';
import { isCdeFormNotFe } from 'shared/item';
import { CdeId } from 'shared/models.model';

export function getIds(f: CdeForm): CdeId[];
export function getIds(f: FormElement): CdeId[] | undefined;
export function getIds(f: FormOrElement): CdeId[] | undefined {
    if (isCdeFormNotFe(f)) {
        return f.ids;
    }
    switch (f.elementType) {
        case 'form':
            return f.inForm.form.ids;
        case 'section':
            return undefined;
        case 'question':
            return f.question.cde.ids;
    }
}
