import { processWorkBook } from 'server/submission/submissionSvc';
import { readFile } from 'xlsx';

const workBook = readFile(process.argv[2]);
if (!workBook) {
    console.error('file is missing');
    process.exit(1);
}
processWorkBook(workBook)
    .then(result => console.log(JSON.stringify(result)));
