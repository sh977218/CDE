import { CdeForm } from 'shared/form/form.model';
import { Item, ItemElastic, ModuleItem } from 'shared/models.model';

export function getModule(elt: Item): ModuleItem {
    return !!(elt as CdeForm).formElements ? 'form' : 'cde';
}

export function getName(elt: Item | ItemElastic): string {
    return (elt as ItemElastic).primaryNameCopy
        ? (elt as ItemElastic).primaryNameCopy
        : elt.designations[0].designation;
}
