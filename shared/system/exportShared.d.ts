import { DataElement } from 'shared/de/dataElement.model';
import { CdeForm } from 'shared/form/form.model';

declare const exportHeader: {
    cdeHeader: string,
    redCapHeader: string
};

declare function getCdeCsvHeader(settings): string;
declare function projectFormForExport(ele: CdeForm): any;
declare function projectCdeForExport(ele: DataElement, settings: any): any;
declare function convertToCsv(ele: any): string;
declare function stripBsonIds(elt: DataElement|CdeForm): DataElement|CdeForm;
declare function nocacheMiddleware(req: any, res: any, next: () => void): void;
