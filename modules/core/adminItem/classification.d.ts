import { Item } from 'shared/models.model';

declare function classifyItem(item: Item, orgName: string, classifPath: string[]): void;
declare function flattenClassification(item: Item): string[];
declare function mergeArrayByProperty(arrayFrom: any, arrayTo: any, property: string): void;
