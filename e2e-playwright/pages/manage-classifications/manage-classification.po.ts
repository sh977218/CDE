import { Locator, Page } from '@playwright/test';

export class ManageClassificationPo {
    protected page: Page;

    constructor(page: Page) {
        this.page = page
    }

    private organizationSelect(): Locator {
        return this.page.getByTestId(`manage-organization-select`);
    }

    private organizationOption(option: string): Locator {
        return this.page.locator(`mat-option`, {
            has: this.page.locator(`text=${option}`)
        })
    }

    async selectOrganization(organization: string) {
        await this.organizationSelect().click();
        await this.organizationOption(organization).click();
    }

    // array starts with organization
    // expand all node in the array
    // return the last node locator in array
    async expandClassificationAndReturnLeafNode(classificationsArray: string[]) {
        if (!classificationsArray.length) {
            throw new Error(`manage classification expandOrgClassification classification array cannot be empty.`)
        }
        let treeNodeLocator;
        for (const classification of classificationsArray) {
            treeNodeLocator = this.page.locator(`mat-tree-node`, {
                has: this.page.locator(`[data-testid="tree-node-text"]`, {
                    has: this.page.locator(`text=${classification}`)
                })
            })
            await treeNodeLocator.getByTestId(`tree-node-toggler`).click();
        }
        if (!treeNodeLocator) {
            throw new Error(`manage classification expandOrgClassification classification cannot find leaf node.`)
        }
        return treeNodeLocator;
    }

    classificationMenu(locator: Locator): Locator {
        return locator.getByTestId(`tree-node-menu-button`);
    }

    classificationOption(option: string): Locator {
        return this.page.locator(`[data-testid="tree-node-menu-option"]`, {
            has: this.page.locator(`text=${option}`)
        })
    }

    confirmRemoveClassificationInput(): Locator {
        return this.page.getByTestId(`confirmRemoveClassificationInput`)
    }

    confirmRemoveClassificationButton(): Locator {
        return this.page.getByTestId(`confirmRemoveClassificationButton`)
    }
}
