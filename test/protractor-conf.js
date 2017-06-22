const Jasmine2HtmlReporter = require('protractor-jasmine2-html-reporter');
const jasmineReporters = require('jasmine-reporters');
const { SpecReporter } = require('jasmine-spec-reporter');


exports.config = {
    framework: 'jasmine',
    specs: ['./protractor/tests/**/*.spec.js'],
    capabilities: {
        browserName: 'chrome'
    },
    maxSessions: 15,
    allScriptsTimeout: 20000,
    jasmineNodeOpts: {
        defaultTimeoutInterval: 60000
    },
    onPrepare: function () {
        jasmine.getEnv().addReporter(
            new jasmineReporters.JUnitXmlReporter({savePath: './protractor/reports'})
        );
        jasmine.getEnv().addReporter(
            new Jasmine2HtmlReporter({
                savePath: './test/report',
                takeScreenshotsOnlyOnFailures: true
            })
        );

        browser.driver.manage().window().maximize();
    }
};