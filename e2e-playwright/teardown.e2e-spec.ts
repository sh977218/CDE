import { join } from 'path';
import NYC from 'nyc';

const coverageThresholds = require('./coverage-thresholds.json');

const PROJECT_ROOT_FOLDER = join(__dirname, '..');

async function globalTeardown() {
    try {
        const nycInstance = new NYC({
            cwd: PROJECT_ROOT_FOLDER,
            reportDir: `coverage-e2e`,
            reporter: ['lcov', 'json', 'text-summary'],
        });
        await nycInstance.checkCoverage(coverageThresholds);
        await nycInstance.report();
    } catch (e) {
        // NYC doesn't throw error when coverage is not met. bug
        throw new Error(`Insufficient playwright code coverage!: ${e}`);
    }
}

export default globalTeardown;
