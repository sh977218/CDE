import { DataElement } from 'shared/de/dataElement.model';
import { CdeForm } from 'shared/form/form.model';

declare const exportHeader: {
    cdeHeader: string,
    redCapHeader: string
};

declare function stripBsonIds(elt: DataElement|CdeForm): DataElement|CdeForm;
