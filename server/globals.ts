import { resolve } from 'path';

global.APP_DIR = __dirname + '/..';
global.assetDir = function assetDir(...args: string[]): string {
    return resolve((global as any).APP_DIR, ...args);
};
