import { expect, Page } from '@playwright/test';
import { MaterialPo } from './material.po';
import { SaveModalPo } from './save-modal.po';

export class ClassificationPo {
    private page: Page;
    private materialPage: MaterialPo;
    private saveModal: SaveModalPo;

    constructor(page: Page, materialPage: MaterialPo, saveModal: SaveModalPo) {
        this.page = page;
        this.materialPage = materialPage;
        this.saveModal = saveModal;
    }

    /**
     * Description - Expand the tree node (not mat-tree) according to the input, and return the leaf node
     * @param classificationsArray - Classification array contains the text from root to leaf (branch)
     */
    async expandClassificationAndReturnLeafNode(classificationsArray: string[]) {
        if (!classificationsArray.length) {
            throw new Error(`classificationPo expandOrgClassification classification array cannot be empty.`);
        }
        let treeNodeLocator: any;
        for (let i = 0; i < classificationsArray.length; i++) {
            const classification = classificationsArray[i];
            const id = classificationsArray.slice(0, i);
            treeNodeLocator = this.page.locator(`tree-node-wrapper`, {
                has: this.page.locator(`[id="${id.join(',')}"]`),
            });
            await new Promise<void>(resolve => {
                const togglerLocator = treeNodeLocator.locator(`.toggle-children-wrapper-collapsed`);
                togglerLocator
                    .waitFor({ timeout: 5000 })
                    .then(async () => {
                        console.info(`${classification} is a branch, toggle to open/expand`);
                        await togglerLocator.click();
                    })
                    .catch(() => {
                        console.info(`${classification} is a leaf`);
                    })
                    .finally(() => {
                        resolve();
                    });
            });
        }
        if (!treeNodeLocator) {
            throw new Error(`manage classification expandOrgClassification classification cannot find leaf node.`);
        }
        return treeNodeLocator;
    }

    // because this is not mat-tree, this method stay here instead of materialPo, but this needs to be converted to mat-tree
    async classifyItemByRecent(orgName: string, categories: string[]) {
        await this.materialPage.matDialog().waitFor();
        await this.page.getByRole('tab', { name: 'By recently added', exact: true }).click();
        await this.materialPage
            .matDialog()
            .locator(`[data-testid="recently-classified-classification"]`, {
                hasText: [orgName].concat(categories).join(' / '),
            })
            .getByRole('button', { name: 'Classify' })
            .click();
        await this.materialPage.matDialog().waitFor({ state: 'hidden' });
    }

    async addClassificationToCDEs(classificationArray: string[]) {
        if (classificationArray.length < 2) {
            throw new Error(`addClassificationToCDEs does not contains any categories.`);
        }
        const org = classificationArray[0];
        const categories = classificationArray.slice(1);
        await this.page.locator(`[id="openClassifyCdesModalBtn"]`).click();
        await this.materialPage.classifyItemByOrgAndCategories(org, categories);
        await this.materialPage.checkAlert(`All CDEs Classified.`);
    }

    /**
     *
     * @param classificationArray - classification array includes org name
     */
    async addClassification(classificationArray: string[]) {
        if (classificationArray.length < 2) {
            throw new Error(`addClassification does not contains any categories.`);
        }
        const org = classificationArray[0];
        const categories = classificationArray.slice(1);
        await this.page.locator(`[id="openClassificationModalBtn"]`).click();
        await this.materialPage.classifyItemByOrgAndCategories(org, categories);
        await this.materialPage.checkAlert(`Classification added.`);
    }

    async addRecentClassification(classificationArray: string[]) {
        if (classificationArray.length < 2) {
            throw new Error(`addRecentClassification does not contains any categories.`);
        }
        const org = classificationArray[0];
        const categories = classificationArray.slice(1);
        await this.page.locator(`[id="openClassificationModalBtn"]`).click();
        await this.classifyItemByRecent(org, categories);
        await this.materialPage.checkAlert(`Classification Already Exists`);
    }

    /**
     *
     * @param classificationArray - First item is org name
     */
    async removeClassification(classificationArray: string[]) {
        if (classificationArray.length < 2) {
            throw new Error(`removeClassification classificationArray does not contains any categories.`);
        }
        const org = classificationArray[0];
        const categories = classificationArray.slice(1);
        const classificationOrgContainer = this.page.locator(`[id="classificationOrg-${org}"]`);
        const classificationLeafText = categories[categories.length - 1];
        const unclassifyButtonId = categories.join(';');
        await classificationOrgContainer.locator(`//*[@id='${unclassifyButtonId}-unclassifyBtn']`).click();
        await this.materialPage.matDialog().waitFor();
        await expect(this.materialPage.matDialog().getByText(`Remove Classification`)).toBeVisible();
        await expect(
            this.materialPage
                .matDialog()
                .getByText(`You are about to delete ${classificationLeafText} classification. Are you sure?`)
        ).toBeVisible();
        await this.materialPage.matDialog().getByRole('button', { name: 'Delete', exact: true }).click();
        await this.materialPage.checkAlert(`Classification removed.`);
        await classificationOrgContainer
            .locator(`//*[@id='${unclassifyButtonId}-unclassifyBtn']`)
            .waitFor({ state: 'hidden' });
    }
}
