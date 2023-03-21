import { FormOrElement } from 'shared/form/form.model';
import { isCdeFormNotFe } from 'shared/item';

export function getVersion(f: FormOrElement): string | undefined {
    if (isCdeFormNotFe(f)) {
        return f.version;
    }
    switch (f.elementType) {
        case 'form':
            return f.inForm.form.version;
        case 'section':
            return undefined;
        case 'question':
            return f.question.cde.version;
    }
}
