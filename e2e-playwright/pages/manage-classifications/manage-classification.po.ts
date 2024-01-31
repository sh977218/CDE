import { Locator, Page } from '@playwright/test';
import { MaterialPo } from '../shared/material.po';
import { ClassificationPo } from '../shared/classification.po';

export class ManageClassificationPo {
    private readonly page: Page;
    private readonly materialPage: MaterialPo;
    private readonly classificationSection: ClassificationPo; // @TODO remove it once convert tree-node to mat-tree

    constructor(page: Page, materialPage: MaterialPo, classificationSection: ClassificationPo) {
        this.page = page;
        this.materialPage = materialPage;
        this.classificationSection = classificationSection;
    }

    organizationSelect(): Locator {
        return this.page.getByTestId(`manage-organization-select`);
    }

    classificationMenu(locator: Locator): Locator {
        return locator.getByTestId(`tree-node-menu-button`);
    }

    classificationOption(option: string): Locator {
        return this.page.locator(`[data-testid="tree-node-menu-option"]`, {
            has: this.page.locator(`text=${option}`),
        });
    }

    addChildClassificationInput() {
        return this.page.locator(`[id="addChildClassifInput"]`);
    }

    confirmAddChildClassificationButton(): Locator {
        return this.page.locator(`[id="confirmAddChildClassificationBtn"]`);
    }

    confirmRemoveClassificationInput(): Locator {
        return this.page.getByTestId(`confirmRemoveClassificationInput`);
    }

    newClassificationInput() {
        return this.page.getByTestId(`new-classification-input`);
    }

    confirmRemoveClassificationButton(): Locator {
        return this.page.getByTestId(`confirmRemoveClassificationButton`);
    }

    confirmRenameClassificationButton(): Locator {
        return this.page.getByTestId(`confirm-rename-classification-button`);
    }

    /**
     *
     * @param classificationArray - First item is org name
     */
    async addOrgClassification(classificationArray: string[]) {
        if (classificationArray.length < 2) {
            throw new Error(`addOrgClassification classificationArray does not contains any categories.`);
        }
        const org = classificationArray[0];
        const rootClassification = classificationArray[1];
        await this.materialPage.selectMatSelect(this.organizationSelect(), org);

        await this.page.route(`/server/classification/addOrgClassification/`, async route => {
            await this.page.waitForTimeout(5000);
            await route.continue();
        });

        // add to first root classification
        await this.page.locator(`[id="addClassificationUnderRoot"]`).click();
        await this.addChildClassificationInput().fill(rootClassification);
        await this.confirmAddChildClassificationButton().click();
        await this.materialPage.checkAlert(`Classification added.`);

        for (let i = 2; i < classificationArray.length; i++) {
            const classificationToBeAdded = classificationArray[i];
            const classificationArrayToBeExpanded = classificationArray.slice(0, i);
            const leafNode = await this.materialPage.expandClassificationAndReturnLeafNode(
                classificationArrayToBeExpanded
            );
            await this.classificationMenu(leafNode).click();
            await this.classificationOption('Add Child Classification').click();
            await this.addChildClassificationInput().fill(classificationToBeAdded);
            await this.confirmAddChildClassificationButton().click();
            await this.materialPage.checkAlert(`Classification added.`);
        }
    }

    /**
     *
     * @param classificationArray - First item is org name
     */
    async removeOrgClassification(classificationArray: string[]) {
        if (classificationArray.length < 2) {
            throw new Error(`removeOrgClassification classificationArray does not contains any categories.`);
        }
        const org = classificationArray[0];
        const classificationsToBeRemoved = classificationArray[classificationArray.length - 1];

        await this.materialPage.selectMatSelect(this.organizationSelect(), org);
        const leafNode = await this.materialPage.expandClassificationAndReturnLeafNode(classificationArray);
        await this.classificationMenu(leafNode).click();
        await this.classificationOption('Remove').click();
        await this.confirmRemoveClassificationInput().fill(classificationsToBeRemoved);
        await this.page.route(`/server/system/jobStatus/deleteClassification`, async route => {
            await this.page.waitForTimeout(5000);
            await route.continue();
        });
        await this.confirmRemoveClassificationButton().click();
        await this.materialPage.checkAlert(`Deleting in progress.`);
        await this.materialPage.checkAlert(`Classification Deleted`);
    }

    /**
     *
     * @param classificationArray - First item is org name
     * @param newClassificationText - New classification text
     */
    async renameOrgClassification(classificationArray: string[], newClassificationText: string) {
        if (classificationArray.length < 2) {
            throw new Error(`renameOrgClassification classificationArray does not contains any categories.`);
        }
        const org = classificationArray[0];

        await this.materialPage.selectMatSelect(this.organizationSelect(), org);
        const leafNode = await this.materialPage.expandClassificationAndReturnLeafNode(classificationArray);
        await this.classificationMenu(leafNode).click();
        await this.classificationOption('Edit').click();
        await this.newClassificationInput().fill(newClassificationText);
        await this.page.route(`/server/system/jobStatus/renameClassification`, async route => {
            await this.page.waitForTimeout(5000);
            await route.continue();
        });
        await this.confirmRenameClassificationButton().click();
        await this.materialPage.checkAlert(`Renaming in progress.`);
        await this.materialPage.checkAlert(`Classification Renamed.`);
    }

    /**
     *
     * @param classificationArray - First item is org name
     * @param newClassificationArray - First item is org name
     */
    async reclassifyOrgClassification(classificationArray: string[], newClassificationArray: string[]) {
        if (classificationArray.length < 2) {
            throw new Error(`reclassifyOrgClassification classificationArray does not contains any categories.`);
        }
        if (classificationArray.length < 2) {
            throw new Error(`reclassifyOrgClassification new classificationArray does not contains any org.`);
        }
        const org = classificationArray[0];
        const newOrg = newClassificationArray[0];
        const newCategories = newClassificationArray.slice(1);

        await this.materialPage.selectMatSelect(this.organizationSelect(), org);
        const leafNode = await this.materialPage.expandClassificationAndReturnLeafNode(classificationArray);
        await this.classificationMenu(leafNode).click();
        await this.classificationOption('Reclassify').click();

        await this.page.route(`/server/system/jobStatus/reclassifyClassification`, async route => {
            await this.page.waitForTimeout(5000);
            await route.continue();
        });
        await this.materialPage.classifyItemByOrgAndCategories(newOrg, newCategories);
        await this.materialPage.checkAlert(`Reclassifying in progress.`);
        await this.materialPage.checkAlert(`Classification Reclassified.`);
    }
}
