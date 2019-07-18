import { initEs } from 'server/system/elastic';
import { syncWithMesh } from 'server/mesh/elastic';
import { syncLinkedForms, syncLinkedFormsByTinyId } from 'server/form/formsvc';

console.log('Elastic Index Running');
initEs(() => {
    console.log('Done indexing collections');
    console.log('Syncing with Mesh');
    Promise.all([
        new Promise(resolve => {
            syncWithMesh(resolve);
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
