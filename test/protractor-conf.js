const Jasmine2HtmlReporter = require('protractor-jasmine2-html-reporter');
const jasmineReporters = require('jasmine-reporters');

exports.config = {
    framework: 'jasmine',
    specs: ['./protractor/tests/**/*.spec.js'],
    capabilities: {
        browserName: 'chrome'
    },
    maxSessions: 15,
    allScriptsTimeout: 30000,
    jasmineNodeOpts: {
        defaultTimeoutInterval: 30000
    },
    onPrepare: function () {
        jasmine.getEnv().addReporter(
            new jasmineReporters.JUnitXmlReporter({savePath: './protractor/reports'})
        );
        jasmine.getEnv().addReporter(
            new Jasmine2HtmlReporter({savePath: './test/report'})
        );
        // setTimeout(() => {
        //     browser.driver.manage().window().maximize();
        //     browser.get("");
        // });
    }
};