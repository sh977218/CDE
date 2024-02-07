import { Page } from '@playwright/test';

export class ProfilePagePo {
    private readonly page: Page;

    constructor(page: Page) {
        this.page = page;
    }

    userNameLabel() {
        return this.page.getByTestId('username-label');
    }

    username() {
        return this.page.getByTestId('username');
    }

    quotaLabel() {
        return this.page.getByTestId('quota-label');
    }

    quota() {
        return this.page.getByTestId('quota');
    }

    userEmailLabel() {
        return this.page.getByTestId('user-email-label');
    }

    userEmail() {
        return this.page.getByTestId('user-email');
    }

    editorForLabel() {
        return this.page.getByTestId('editor-for-label');
    }

    editorFor() {
        return this.page.getByTestId('editor-for');
    }

    curatorForLabel() {
        return this.page.getByTestId('curator-for-label');
    }

    curatorFor() {
        return this.page.getByTestId('curator-for');
    }

    adminForLabel() {
        return this.page.getByTestId('admin-for-label');
    }

    adminFor() {
        return this.page.getByTestId('admin-for');
    }
}
