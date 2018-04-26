import { Elt } from 'shared/models.model';

type itemActionsApi = {
    api: string,
    apiById: string,
    apiById_prior: string,
    apiDraft: string,
    apiDraftById: string,
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