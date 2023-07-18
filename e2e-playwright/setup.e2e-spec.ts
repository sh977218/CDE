import { FullConfig } from '@playwright/test';
import { promises as fs } from 'fs';
import { join } from 'path';

async function globalSetup(config: FullConfig) {
    const projectRootFolder = join(__dirname, '..');
    await fs.rm(join(projectRootFolder, `e2e-playwright/.nyc_output`), { recursive: true, force: true });
    await fs.mkdir(join(projectRootFolder, `e2e-playwright/.nyc_output`));
}

export default globalSetup;
