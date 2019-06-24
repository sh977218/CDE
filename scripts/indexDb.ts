import { initEs } from '../server/system/elastic';
import { syncWithMesh } from '../server/mesh/elastic';

console.log('Elastic Index Running');
initEs(() => {
    syncWithMesh(() => process.exit(0));
});
