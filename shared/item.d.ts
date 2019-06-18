import { Elt, Item } from 'shared/models.model';
import { DataElement } from '../shared/de/dataElement.model';
import { CdeForm } from '../shared/form/form.model';

type itemActionsApi = {
    api: string,
    apiById: string,
    apiById_prior: string,
    apiDraft: string,
    apiDraftById: string,
    schema: string,
    view: string,
    viewById: string,
};

declare const ITEM_MAP: {
    board: {
        view: string,
        item: {
            cde: {
                api: string,
            },
            form: {
                api: string,
            }
        }
    },
    cde: itemActionsApi,
    form: itemActionsApi
};

declare function isCdeForm(item: Item): item is CdeForm;
declare function isDataElement(item: Item): item is DataElement;
declare function uriView(module: string, tinyId: string): string|undefined;
declare function uriViewBase(module: string): string|undefined;
