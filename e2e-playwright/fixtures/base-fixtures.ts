import { test as baseTest } from '@playwright/test';
import { randomBytes } from 'crypto';
import { promises as fs } from 'fs';
import { join } from 'path';
import { AioTocViewMenuPo } from '../pages/aio-toc-view-menu.po';
import { BasePagePo } from '../pages/base-page.po';
import { SearchPagePo } from '../pages/search-page.po';

async function codeCoverage(page) {
    const coverage: string = await page.evaluate(
        'JSON.stringify(window.__coverage__);'
    );
    const name = randomBytes(32).toString('hex');
    if (coverage) {
        const projectRootFolder = join(__dirname, '../..');
        const nycOutput = join(projectRootFolder, `/e2e-playwright/.nyc_output/${name}.json`);
        await fs.writeFile(nycOutput, coverage);
    }
}

const test = baseTest.extend<{
    basePage: BasePagePo,
    aioTocViewMenuPo: AioTocViewMenuPo,
    searchPage: SearchPagePo
}>({
        basePage: async ({page}, use) => {
            await use(new BasePagePo(page))
            await codeCoverage(page);
        },
        aioTocViewMenuPo: async ({page}, use) => {
            await use(new AioTocViewMenuPo(page))
            await codeCoverage(page);
        },
        searchPage: async ({page}, use) => {
        await use(new SearchPagePo(page))
        await codeCoverage(page);
    },
    }
)

export default test;
