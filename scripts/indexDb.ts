// to override express.request.user
import * as authorization from 'server/system/authorization';

import 'server/globals';
import { syncLinkedFormsByTinyId } from 'server/form/syncLinkedForms';
import { initEs } from 'server/system/elastic';

initEs(() => {
    console.log('Done indexing collections');
    Promise.all([
        syncLinkedFormsByTinyId('myg51_nyXg'),
        syncLinkedFormsByTinyId('7J69yuhyme'),
        syncLinkedFormsByTinyId('QJmc1OnyQe'),
        syncLinkedFormsByTinyId('QkZ91d2yXx'),
        syncLinkedFormsByTinyId('QJdxq1unyQl'),
        syncLinkedFormsByTinyId('mJR9Jd2JQx'),
        syncLinkedFormsByTinyId('Xyl_qyuhJ7e'),
        syncLinkedFormsByTinyId('XJVu4kHHFg'),
        syncLinkedFormsByTinyId('712ArJSHYl'),
        syncLinkedFormsByTinyId('QktaN3OFL4'),
    ]).then(() => {
        console.log(`indexDb.ts finished successfully.`);
        process.exit(0);
    }, err => {
        console.log(`indexDb.ts error ${err}`);
        process.exit(1);
    });
});
