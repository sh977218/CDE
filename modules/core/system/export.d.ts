import { DataElement } from 'shared/de/dataElement.model';
import { CdeForm } from 'shared/form/form.model';
import { TableViewFields } from 'shared/models.model';

declare function getCdeCsvHeader(settings: TableViewFields): string;
declare function projectFormForExport(ele: CdeForm): any;
declare function projectCdeForExport(ele: DataElement, settings: TableViewFields): Object;
declare function convertToCsv(obj: Object): string;
