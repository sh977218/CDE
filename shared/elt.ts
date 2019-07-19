import { CdeForm } from 'shared/form/form.model';
import { Item, ItemElastic, ModuleItem } from 'shared/models.model';

export function getModule(elt: Item): ModuleItem {
    return !!(elt as CdeForm).formElements ? 'form' : 'cde';
}

export function getName(elt: ItemElastic): string {
    if (elt.primaryNameCopy) {
        return elt.primaryNameCopy;
    } else {
        return elt.designations[0].designation;
    }
}
