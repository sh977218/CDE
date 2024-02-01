import { DataElement } from 'shared/de/dataElement.model';
import { CdeForm } from 'shared/form/form.model';
import { Elt, Item, ItemElastic, ModuleItem } from 'shared/models.model';
import { copyDeep } from 'shared/util';

export function deepCopyElt(elt: DataElement): DataElement;
export function deepCopyElt(elt: CdeForm): CdeForm;
export function deepCopyElt(elt: Item): Item;
export function deepCopyElt(elt: Item): Item {
    const eltCopy = copyDeep(elt);
    eltCopy.registrationState.administrativeNote = 'Copy of: ' + elt.tinyId;
    delete (eltCopy as any).tinyId;
    delete eltCopy._id;
    delete eltCopy.origin;
    delete eltCopy.created;
    delete eltCopy.updated;
    delete eltCopy.imported;
    delete eltCopy.updatedBy;
    delete eltCopy.createdBy;
    delete eltCopy.version;
    delete (eltCopy as any).history;
    delete eltCopy.changeNote;
    delete (eltCopy as any).comments;
    eltCopy.ids = [];
    eltCopy.sources = [];
    eltCopy.designations[0].designation = 'Copy of: ' + eltCopy.designations[0].designation;
    eltCopy.registrationState = {
        administrativeNote: 'Copy of: ' + elt.tinyId,
        registrationStatus: 'Incomplete',
    };
    return eltCopy;
}

export function deOrForm(module: ModuleItem) {
    return module === 'form' ? 'form' : 'de';
}

export function filterClassificationPerUser(elt: Elt, userOrgs: string[]) {
    elt.classification = elt.classification.filter(c => userOrgs.indexOf(c.stewardOrg.name) !== -1);
}

export function getModule(elt: Item): ModuleItem {
    return !!(elt as CdeForm).formElements ? 'form' : 'cde';
}

export function getName(elt: Item | ItemElastic): string {
    return (elt as ItemElastic).primaryNameCopy
        ? (elt as ItemElastic).primaryNameCopy
        : elt.designations[0].designation;
}
