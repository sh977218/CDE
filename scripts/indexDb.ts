import { initEs } from 'server/system/elastic';
import { syncWithMesh } from 'server/mesh/elastic';

console.log('Elastic Index Running');
initEs(() => {
    console.log("Done indexing collections");
    console.log("Syncing with Mesh");
    syncWithMesh(() => process.exit(0));
});
