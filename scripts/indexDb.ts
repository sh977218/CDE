import 'server/globals';
import { syncLinkedFormsByCdeTinyId } from 'server/form/syncLinkedForms';
import { initEs } from 'server/system/elastic';
import { syncWithMesh } from 'server/mesh/elastic';
import { Cb, CbError } from 'shared/models.model';

initEs(() => {
    console.log('Done indexing collections');
    console.log('Syncing with Mesh');

    Promise.all([
        new Promise<void>((resolve: Cb, reject: CbError) => {
            syncWithMesh((err) => err ? reject(err) : resolve());
        }),
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
