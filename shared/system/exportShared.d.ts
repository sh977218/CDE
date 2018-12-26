import { DataElement } from 'shared/de/dataElement.model';
import { CdeForm } from 'shared/form/form.model';
import { TableViewFields } from 'shared/models.model';

declare const exportHeader: {
    cdeHeader: string,
    redCapHeader: string
};

declare function getCdeCsvHeader(settings: TableViewFields): string;
declare function projectFormForExport(ele: CdeForm): any;
declare function projectCdeForExport(ele: DataElement, settings: TableViewFields): Object;
declare function convertToCsv(obj: Object): string;
declare function stripBsonIds(elt: DataElement|CdeForm): DataElement|CdeForm;
declare function nocacheMiddleware(req: any, res: any, next: () => void): void;
