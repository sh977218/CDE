exports.config = {
    framework: 'jasmine',
    seleniumAddress: 'http://130.14.175.7/wd/hub',
    specs: ['spec.js'],
    capabilities: {
        browserName: 'firefox'
    }
}