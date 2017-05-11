exports.config = {
    framework: 'jasmine',
    specs: ['./protractor/tests/**/*.spec.js'],
    capabilities: {
        browserName: 'chrome'
    }
}