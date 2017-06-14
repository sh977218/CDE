exports.config = {
    framework: 'jasmine',
    specs: ['./protractor/tests/**/*.spec.js'],
    capabilities: {
        browserName: 'chrome'
    },
    jasmineNodeOpts: {
        defaultTimeoutInterval: 20000
    },
    allScriptsTimeout: 30000,
    onPrepare: function () {
        let jasmineReporters = require('jasmine-reporters');
        jasmine.getEnv().addReporter(
            new jasmineReporters.JUnitXmlReporter({savePath: './protractor/reports'})
        );
    }
};