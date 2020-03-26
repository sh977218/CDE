import * as csv from 'csv-parse';
import { createReadStream } from 'fs';
import { isEmpty } from 'lodash';

export function parseCSV(csvFile) {
    return new Promise((resolve, reject) => {
        const results: (string | Buffer)[] = [];
        const options = {
            trim: true,
            skip_empty_lines: true,
            columns: true,
            relax_column_count: true
        };
        createReadStream(csvFile)
            .pipe(csv(options))
            .on('data', data => {
                if (!isEmpty(data)) {
                    results.push(data);
                }
            })
            .on('err', err => {
                reject(err);
            })
            .on('end', () => {
                resolve(results);
            });
    });
}
