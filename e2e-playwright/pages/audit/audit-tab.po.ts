import { Locator, Page } from '@playwright/test';

export class AuditTabPo {
    protected page: Page;

    constructor(page: Page) {
        this.page = page;
    }

    httpLogs(): Locator {
        return this.page.getByRole(`tab`, { name: 'Http Logs', exact: true });
    }

    appLogs(): Locator {
        return this.page.getByRole(`tab`, { name: 'App Logs', exact: true });
    }
    dailyUsage(): Locator {
        return this.page.getByRole(`tab`, { name: 'Daily Usage', exact: true });
    }
    cdeAuditLog(): Locator {
        return this.page.getByRole(`tab`, { name: 'CDE Audit Log', exact: true });
    }

    formAuditLog(): Locator {
        return this.page.getByRole(`tab`, { name: 'Form Audit Log', exact: true });
    }

    classificationAuditLog(): Locator {
        return this.page.getByRole(`tab`, { name: 'Classification Audit Log', exact: true });
    }

    activeBans(): Locator {
        return this.page.getByRole(`tab`, { name: 'Active Bans', exact: true });
    }

    serverErrors(): Locator {
        return this.page.getByRole(`tab`, { name: 'Server Errors', exact: true });
    }
    clientErrors(): Locator {
        return this.page.getByRole(`tab`, { name: 'Client Errors', exact: true });
    }
    loginRecords(): Locator {
        return this.page.getByRole(`tab`, { name: 'Login Records', exact: true });
    }
}
