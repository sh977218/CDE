import { defineConfig, devices, PlaywrightTestConfig } from '@playwright/test';

const config: PlaywrightTestConfig = defineConfig({
    testDir: './tests',
    testMatch: ['*spec.ts'],
    globalSetup: require.resolve('./setup.e2e-spec'),
    globalTeardown: require.resolve('./teardown.e2e-spec'),
    /* Maximum time one test can run for. */
    maxFailures: 10,
    /* Run tests in files in parallel */
    fullyParallel: true,
    /* Fail the build on CI if you accidentally left test.only in the source code. */
    forbidOnly: !!process.env.CI,
    /* Retry on CI only */
    retries: 1,
    /* Opt out of parallel tests on CI. */
    workers: process.env.CI ? 8 : 1,
    /* Reporter to use. See https://playwright.dev/docs/test-reporters */
    reporter: [
        ['html', { outputFolder: `../playwright-report` }],
        ['junit', { outputFile: `../playwright-report/report-junit.xml` }],
    ],
    /* Folder for test artifacts such as screenshots, videos, traces, etc. */
    outputDir: 'test-results',

    /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
    use: {
        /* Maximum time each action such as `click()` can take. Defaults to 0 (no limit). */
        actionTimeout: 0,
        /* Base URL to use in actions like `await page.goto('/')`. */
        baseURL: 'http://localhost:4200',

        /* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
        trace: process.env.CI ? 'on-first-retry' : 'on',
        screenshot: process.env.CI ? 'only-on-failure' : 'on',
        video: process.env.CI ? 'on-first-retry' : 'on',
    },

    /* Configure projects for major browsers */
    projects: [
        {
            timeout: 300 * 1000,
            expect: {
                timeout: 10 * 1000,
            },
            name: 'CDE-e2e',
            use: { ...devices['Desktop Chrome'], ignoreHTTPSErrors: true },
            fullyParallel: true,
        },
        {
            timeout: 100 * 1000,
            expect: {
                timeout: 10 * 1000,
            },
            name: 'CDE-smokeTest',
            use: { ...devices['Desktop Chrome'], ignoreHTTPSErrors: true },
            grep: [/@smoke/, /@debug/],
            fullyParallel: true,
            retries: 0,
        },
    ],

    /* Run your local dev server before starting the tests */
    webServer: {
        command: 'npm run devApp:coverage',
        port: 4200,
        timeout: 150 * 1000,
        reuseExistingServer: true,
    },
});
export default config;
