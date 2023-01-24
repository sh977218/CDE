// to override express.request.user
import * as authorization from 'server/system/authorization';

import 'server/globals';
import { syncLinkedFormsByCdeTinyId } from 'server/form/syncLinkedForms';
import { initEs } from 'server/system/elastic';

initEs(() => {
    console.log('Done indexing collections');
    Promise.all([
        syncLinkedFormsByCdeTinyId('myg51_nyXg'),
        syncLinkedFormsByCdeTinyId('7J69yuhyme'),
        syncLinkedFormsByCdeTinyId('QJmc1OnyQe'),
        syncLinkedFormsByCdeTinyId('QkZ91d2yXx'),
        syncLinkedFormsByCdeTinyId('QJdxq1unyQl'),
        syncLinkedFormsByCdeTinyId('mJR9Jd2JQx'),
        syncLinkedFormsByCdeTinyId('Xyl_qyuhJ7e'),
        syncLinkedFormsByCdeTinyId('XJVu4kHHFg'),
        syncLinkedFormsByCdeTinyId('712ArJSHYl'),
        syncLinkedFormsByCdeTinyId('QktaN3OFL4'),
        syncLinkedFormsByCdeTinyId('71dJFmQJyg'),
        syncLinkedFormsByCdeTinyId('JtjaQb3RDVh'),
        syncLinkedFormsByCdeTinyId('xcWdhjpJWsp'),
        syncLinkedFormsByCdeTinyId('XkTjty_hyQe'),
        syncLinkedFormsByCdeTinyId('GA7OQTKXHuR'),
    ]).then(() => {
        console.log(`indexDb.ts finished successfully.`);
        process.exit(0);
    }, err => {
        console.log(`indexDb.ts error ${err}`);
        process.exit(1);
    });
});
