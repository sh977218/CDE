import { expect, defineConfig, devices, PlaywrightTestConfig } from '@playwright/test';

expect.extend({
    trimmedToBe(received: string, expected: string) {
        const pass = received.trim() === expected;
        if (pass) {
            return {
                message: () => 'passed',
                pass: true,
            };
        } else {
            return {
                message: () => 'failed',
                pass: false,
            };
        }
    },
});

const config: PlaywrightTestConfig = defineConfig({
    testDir: './tests',
    testMatch: ['/*.spec.ts'],
    globalSetup: process.env.a11y ? '' : require.resolve('./setup.e2e-spec'),
    globalTeardown: process.env.a11y ? '' : require.resolve('./teardown.e2e-spec'),
    /* Maximum time one test can run for. */
    timeout: 300 * 1000,
    maxFailures: 10,
    expect: {
        /**
         * Maximum time expect() should wait for the condition to be met.
         * For example in `await expect(locator).toHaveText();`
         */
        timeout: 5000
    },
    /* Run tests in files in parallel */
    fullyParallel: true,
    /* Fail the build on CI if you accidentally left test.only in the source code. */
    forbidOnly: !!process.env.CI,
    /* Retry on CI only */
    retries: 1,
    /* Opt out of parallel tests on CI. */
    workers: process.env.CI ? 8 : 1,
    /* Reporter to use. See https://playwright.dev/docs/test-reporters */
    reporter: process.env.a11y ? '' : [
        ['html', {outputFile: 'playwright-report/report-html.html'}],
        ['junit', {outputFile: 'playwright-report/report-junit.xml'}],
    ],
    /* Folder for test artifacts such as screenshots, videos, traces, etc. */
    outputDir: 'playwright-report/test-results',

    /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
    use: {
        /* Maximum time each action such as `click()` can take. Defaults to 0 (no limit). */
        actionTimeout: 0,
        /* Base URL to use in actions like `await page.goto('/')`. */
        baseURL: 'http://localhost:4200',

        /* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
        trace: 'on-first-retry',
        screenshot: 'only-on-failure',
        video: process.env.CI ? 'on-first-retry' : 'on'
    },

    /* Configure projects for major browsers */
    projects: [
        {
            name: 'CDE-Chromium',
            use: {...devices['Desktop Chrome'], ignoreHTTPSErrors: true},
            testMatch: /.*.spec.cde.ts/,
            fullyParallel: true
        },
        {
            name: 'CDE-Chromium-a11y',
            use: {...devices['Desktop Chrome'], ignoreHTTPSErrors: true},
            testMatch: /.*.spec.a11y.ts/,
            fullyParallel: true
        }
    ],

    /* Run your local dev server before starting the tests */
    webServer: {
        command: process.env.a11y ? 'npm run devApp' : 'npm run start:playwright',
        port: 4200,
        timeout: 150 * 1000
    },
});
export default config;
