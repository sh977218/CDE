declare let APP_DIR: string;
declare let APPLICATION_NAME: string;
declare let INACTIVE_TIMEOUT: number;
declare let PRODUCTION: boolean;
declare let NAVIGATION_HEIGHT: number;
declare let NAVIGATION_HEIGHT_MOBILE: number;

// Workaround missing types
declare module 'async/forEach';
declare module 'async/forEachOf';
declare module 'async/forEachSeries';
declare module 'async/memoize';
declare module 'async/series';
declare module 'async/some';
declare module 'bootstrap-tour/build/js/bootstrap-tour-standalone.min.js';
declare module 'connect-mongo';
declare module 'file-list-plugin';
declare module 'gulp-clean-css';
declare module 'gulp-data';
declare module 'gulp-git';
declare module 'gulp-usemin';
declare module 'merge-stream';
declare module 'js-toggle-switch/dist/toggle-switch';
declare module 'jxon';
declare module 'lodash/clone';
declare module 'lodash/cloneDeep';
declare module 'lodash/curry' {
    import { curry } from 'lodash';
    export = curry;
}
declare module 'lodash/curryRight' {
    import { curryRight } from 'lodash';
    export = curryRight;
}
declare module 'lodash/differenceWith';
declare module 'lodash/find';
declare module 'lodash/findEach';
declare module 'lodash/forEach';
declare module 'lodash/get';
declare module 'lodash/intersection';
declare module 'lodash/intersectionWith';
declare module 'lodash/isArray';
declare module 'lodash/isEmpty';
declare module 'lodash/isEqual';
declare module 'lodash/noop';
declare module 'lodash/remove';
declare module 'lodash/slice';
declare module 'lodash/sortBy';
declare module 'lodash/toString';
declare module 'lodash/trim';
declare module 'lodash/union';
declare module 'lodash/uniq';
declare module 'lodash/uniqWith';
declare module 'simple-spellchecker';
