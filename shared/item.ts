import { DataElement } from 'shared/de/dataElement.model';
import { CdeForm } from 'shared/form/form.model';
import { Item, ModuleAll } from 'shared/models.model';

interface ItemActionsApi {
    api: string;
    apiById: string;
    apiById_prior: string;
    apiDraft: string;
    apiDraftById: string;
    schema: string;
    view: string;
    viewById: string;
}

export const ITEM_MAP: {
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
    cde: ItemActionsApi,
    form: ItemActionsApi
} = {
    board: {
        view: '/board/',
        item: {
            cde: {
                api: '/server/board/deBoards/'
            },
            form: {
                api: '/server/board/formBoards/'
            }
        }
    },
    cde: {
        api: '/de/',
        apiById: '/deById/',
        apiById_prior: '/priorDataElements',
        apiDraft: '/draftDataElement/',
        apiDraftById: '/draftDataElementById/',
        schema: '/schema/cde',
        view: '/deView?tinyId=',
        viewById: '/deView?cdeId=',
    },
    form: {
        api: '/form/',
        apiById: '/formById/',
        apiById_prior: '/priorForms',
        apiDraft: '/draftForm/',
        apiDraftById: '/draftFormById/',
        schema: '/schema/form',
        view: '/formView?tinyId=',
        viewById: '/formView?formId=',
    }
};

export function isCdeForm(item: Item): item is CdeForm {
    return item.elementType === 'form';
}

export function isDataElement(item: Item): item is DataElement {
    return item.elementType === 'cde';
}

export function uriView(module: ModuleAll, tinyId: string): string|undefined {
    const mod = ITEM_MAP[module];
    return mod && mod.view && (mod.view + tinyId);
}

export function uriViewBase(module: string): string|undefined {
    return module === 'board' && '/board'
        || module === 'cde' && '/deView'
        || module === 'form' && '/formView'
        || undefined;
}
