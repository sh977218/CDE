import { initEs } from '../server/system/elastic';

console.log('Elastic Index Running');
initEs(() => process.exit(0));
