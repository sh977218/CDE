import { DataElement, DataElementElastic } from 'shared/de/dataElement.model';
import { CdeForm, CdeFormElastic, FormElement } from 'shared/form/form.model';
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
        view: string;
        item: {
            cde: {
                api: string;
            };
            form: {
                api: string;
            };
        };
    };
    cde: ItemActionsApi;
    form: ItemActionsApi;
} = {
    board: {
        view: '/board/',
        item: {
            cde: {
                api: '/server/board/deBoards/',
            },
            form: {
                api: '/server/board/formBoards/',
            },
        },
    },
    cde: {
        api: '/api/de/',
        apiById: '/server/de/byId/',
        apiById_prior: '/server/de/prior/',
        apiDraft: '/server/de/draft/',
        apiDraftById: '/server/de/draft/byId/',
        schema: '/schema/de',
        view: '/deView?tinyId=',
        viewById: '/deView?cdeId=',
    },
    form: {
        api: '/api/form/',
        apiById: '/server/form/byId/',
        apiById_prior: '/server/form/prior/',
        apiDraft: '/server/form/draft/',
        apiDraftById: '/server/form/draft/byId/',
        schema: '/schema/form',
        view: '/formView?tinyId=',
        viewById: '/formView?formId=',
    },
};

export function itemAsElastic<T extends DataElement | CdeForm>(
    doc: T
): T extends DataElement ? DataElementElastic : CdeFormElastic {
    const elt = doc as unknown as T extends DataElement ? DataElementElastic : CdeFormElastic;
    elt.stewardOrgCopy = elt.stewardOrg;
    elt.primaryNameCopy = encodeURIComponent(elt.designations[0].designation);
    elt.primaryDefinitionCopy = '';
    if (elt.definitions[0] && elt.definitions[0].definition) {
        elt.primaryDefinitionCopy = encodeURIComponent(elt.definitions[0].definition);
    }
    return elt;
}

export function isCdeForm(item: Item | FormElement): item is CdeForm {
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

export function uriViewBase(module: string): string | undefined {
    return (
        (module === 'board' && '/board') ||
        (module === 'cde' && '/deView') ||
        (module === 'form' && '/formView') ||
        undefined
    );
}
