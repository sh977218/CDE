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
