import { capString } from 'shared/system/util';

export const ITEM_MAP = {
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

export function uriView(module, tinyId) {
    let mod = ITEM_MAP[module];
    return mod && mod.view && (mod.view + tinyId);
}

export function uriViewBase(module) {
    return module === 'board' && '/board'
        || module === 'cde' && '/deView'
        || module === 'form' && '/formView'
        || undefined;
}
