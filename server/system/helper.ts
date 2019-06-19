import { config } from '../../server/system/parseConfig';

export const GLOBALS = {
    logdir : config.logdir || __dirname,
    REQ_TIMEOUT : 2000,
};
