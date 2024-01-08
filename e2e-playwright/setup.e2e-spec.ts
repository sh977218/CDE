import { promises as fs } from 'fs';
import { join } from 'path';

const PROJECT_ROOT_FOLDER = join(__dirname, '..');
const NYC_OUTPUT_FOLDER = join(PROJECT_ROOT_FOLDER, '.nyc_output');

async function globalSetup() {
    await fs.rm(NYC_OUTPUT_FOLDER, { recursive: true, force: true });
    await fs.mkdir(NYC_OUTPUT_FOLDER);
}

export default globalSetup;
