import { Elt } from 'shared/models.model';

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

declare function uriView(module: string, tinyId: string): string|undefined;
declare function uriViewBase(module: string): string|undefined;
