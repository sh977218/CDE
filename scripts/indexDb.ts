import { syncLinkedFormsByTinyId } from 'server/form/syncLinkedForms';
import { syncWithMesh } from 'server/mesh/elastic';
import { initEs } from 'server/system/elastic';
import { Cb, CbError } from 'shared/models.model';

initEs(() => {
    console.log('Done indexing collections');
    console.log('Syncing with Mesh');
    Promise.all([
        new Promise((resolve: Cb, reject: CbError) => {
            syncWithMesh((err) => err ? reject(err) : resolve());
        }),
        syncLinkedFormsByTinyId('myg51_nyXg'),
        syncLinkedFormsByTinyId('7J69yuhyme'),
        syncLinkedFormsByTinyId('QJmc1OnyQe'),
        syncLinkedFormsByTinyId('QkZ91d2yXx'),
        syncLinkedFormsByTinyId('QJdxq1unyQl'),
        syncLinkedFormsByTinyId('mJR9Jd2JQx'),
        syncLinkedFormsByTinyId('Xyl_qyuhJ7e'),
    ]).then(() => process.exit(0));
});
