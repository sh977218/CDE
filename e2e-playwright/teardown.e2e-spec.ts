import { FullConfig } from '@playwright/test';
import { promises as fs } from 'fs';
import { join } from 'path';
import NYC from 'nyc';

async function globalTeardown(config: FullConfig) {
    const projectRootFolder = join(__dirname, '..');
    const nycInstance = new NYC({
        cwd: projectRootFolder,
        tempDir: join(projectRootFolder, `e2e-playwright/.nyc_output`),
        reportDir: join(projectRootFolder, `e2e-playwright/coverage-e2e`),
        reporter: ['lcov', 'json', 'text-summary'],
    });
    await nycInstance.report();
    await fs.rm(join(projectRootFolder, `e2e-playwright/.nyc_output`), {recursive: true, force: true});
}

export default globalTeardown;
