import { capString } from 'shared/system/util';

export const ITEM_MAP = {
    board: {
        view: '/board/',
        item: {
            cde: {
                api: '/deBoards/'
            },
            form: {
                api: '/formBoards/'
            }
        }
    },
    cde: {
        api: '/de/',
        apiById: '/deById/',
        apiById_prior: '/priorDataElements',
        apiDraft: '/draftDataElement/',
        apiDraftById: '/draftDataElementById/',
        view: '/deView?tinyId=',
        viewById: '/deView?cdeId=',
    },
    form: {
        api: '/form/',
        apiById: '/formById/',
        apiById_prior: '/priorForms',
        apiDraft: '/draftForm/',
        apiDraftById: '/draftFormById/',
        view: '/formView?tinyId=',
        viewById: '/formView?formId=',
    }
};
