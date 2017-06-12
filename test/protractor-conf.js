exports.config = {
    framework: 'jasmine',
    specs: ['./protractor/tests/**/*.spec.js'],
    capabilities: {
        browserName: 'chrome'
    },
    allScriptsTimeout: 30000,
    onPrepare: function () {
        let jasmineReporters = require('jasmine-reporters');
        jasmine.getEnv().addReporter(
            new jasmineReporters.JUnitXmlReporter({savePath: './protractor/reports'})
        );
    }
};