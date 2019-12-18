import { DataElement } from 'shared/de/dataElement.model';
import { CdeForm, FormElement } from 'shared/form/form.model';
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
        api: '/server/cde/de/',
        apiById: '/server/cde/deById/',
        apiById_prior: '/priorDataElements',
        apiDraft: '/server/cde/draftDataElement/',
        apiDraftById: '/server/cde/draftDataElementById/',
        schema: '/server/cde/schema/cde',
        view: '/server/cde/deView?tinyId=',
        viewById: '/server/cde/deView?cdeId=',
    },
    form: {
        api: 'server/form/form/',
        apiById: 'server/form/formById/',
        apiById_prior: 'server/form/priorForms',
        apiDraft: 'server/form/draftForm/',
        apiDraftById: 'server/form/draftFormById/',
        schema: 'server/form/schema/form',
        view: 'server/form/formView?tinyId=',
        viewById: 'server/form/formView?formId=',
    }
};

export function isCdeForm(item: Item | FormElement ): item is CdeForm {
    return item.elementType === 'form' && isCdeFormNotFe(item as CdeForm | FormElement);
}

export function isCdeFormNotFe(f: CdeForm | FormElement): f is CdeForm {
    return f.hasOwnProperty('tinyId');
}

export function isDataElement(item: Item): item is DataElement {
    return item.elementType === 'cde';
}

export function uriView(module: ModuleAll, tinyId: string): string {
    return ITEM_MAP[module].view + tinyId;
}

export function uriViewBase(module: string): string|undefined {
    return module === 'board' && '/board'
        || module === 'cde' && '/deView'
        || module === 'form' && '/formView'
        || undefined;
}
