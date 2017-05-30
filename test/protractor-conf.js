exports.config = {
    framework: 'jasmine',
    specs: ['./protractor/tests/**/*.spec.js'],
    capabilities: {
        browserName: 'chrome'
    },
    onPrepare: function () {
        let jasmineReporters = require('jasmine-reporters');
        jasmine.getEnv().addReporter(
            new jasmineReporters.JUnitXmlReporter({savePath: './protractor/reports'})
        );
    }
};