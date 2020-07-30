const logFolder = './build/consolelogs';
const fs = require('fs');

let expectedContent = {
    addSiteAdmin: ['status of 422', 'status of 404'],
    assignVsacId: 'the server responded with a status of 404',
    badQuery: 'de/search - Failed to load resource: the server responded with a status of 400 (Bad Request)',
    boardFiveUnapprovedMessagesPerUserReply: 'the server responded with a status of 403 (Forbidden)',
    boardPublisher: [
        'the server responded with a status of 403 (Forbidden)',
        'You don\'t have permission to make boards public!'
    ],
    cdeAddClassification: 'addCdeClassification/ - Failed to load resource: the server responded with a status of 409 (Conflict)',
    cdeLiveCommentTest: '*',
    cdeTinyIdSwaggerApi: [
        'docs/swagger-ui-bundle.js 51:49866 "Could not find component"',
        'Unable to get the Swagger UI URL from the server'
    ],
    cdeTinyIdVersionSwaggerApi: [
        'docs/swagger-ui-bundle.js 51:49866 "Could not find component"',
        'Unable to get the Swagger UI URL from the server'
    ],
    checkDuplicatesClassification: 'the server responded with a status of 409',
    createUser: 'with a status of 409',
    dupStewardValidation: [
        "Error publishing DataElement validation failed",
        "422 (Unprocessable Entity)"
    ],
    embedNinds: '*',
    emptyAnswers: 'the server responded with a status of 500',
    formHistoryCompareTest: "*",
    formDraftConcurrentWrite: [
        'Failed to load resource: the server responded with a status of 409 (Conflict)',
        'Edited by someone else. Please refresh and redo.'
    ],
    formFiveUnapprovedMessagesPerUserComment: 'Failed to load resource: the server responded with a status of 403 (Forbidden)',
    formOneUnapprovedReplyPerUser: 'Failed to load resource: the server responded with a status of 403 (Forbidden)',
    formReorderProperties: [
        'Failed to load resource: the server responded with a status of 409 (Conflict)',
        'Edited by someone else. Please refresh and redo.'
    ],
    formDupStewardValidation: [
        "Error publishing Form validation failed",
        "422 (Unprocessable Entity)"
    ],
    formTinyIdSwaggerApi: [
        'docs/swagger-ui-bundle.js 51:49866 "Could not find component"',
        'Unable to get the Swagger UI URL from the server'
    ],
    formTinyIdVersionSwaggerApi: [
        'docs/swagger-ui-bundle.js 51:49866 "Could not find component"',
        'Unable to get the Swagger UI URL from the server'
    ],
    importVsacValues: "with a status of 500",
    increaseLockoutLogin: 'login - Failed to load resource: the server responded with a status of 403',
    launchFhirApp: '*',
    lockoutLogin: 'login - Failed to load resource: the server responded with a status of 403',
    logClientErrors: '*',
    meshTopics: 'classificationmanagement - Form submission canceled because the form is not connected',
    noDoublePin: [
        'Failed to load resource: the server responded with a status of 409 (Conflict)',
        'Already added'
    ],
    pageNotFound: 'Failed to load resource: the server responded with a status of 404 (Not Found)',
    publicVsPrivateBoards: [
        'Failed to load resource: the server responded with a status of',
        'Board Not Found'
    ],
    report: "*",
    resourcesPage: 'Content Security Policy',
    searchPageSize: '*',
    tooManyBoards: [
        'board - Failed to load resource: the server responded with a status of 403 (Forbidden)',
        'You have too many boards!'
    ],
    uomValidation: "*",
    validRulesPvUmls: 'Failed to load resource: the server responded with a status of 400 (Bad Request)',
    wrongLogin: 'login - Failed to load resource: the server responded with a status of 403',
    youtubeVideo: 'SameSite'
};

let ignoreErrors = [
    ':3001/server/de/originalSource/',
    ':3001/server/form/originalSource/',
    'listbox select is deprecated and will be removed in M79',
    'reportOnly',
    'Report Only',
    'Failed to decode downloaded font',
    'Slow network is detected',
    'WebSocket is already in CLOSING or CLOSED state',
    'petstore.swagger.io'
];

fs.readdir(logFolder, (err, files) => {
    if (err || !files) {
        console.log(err);
        console.log('INFO: Console Logs Not Created.');
        process.exit(0);
    }
    let errors = [];
    files.forEach(file => {
        let expectedLines = expectedContent[file.split('_')[0]];
        let actualLines = fs.readFileSync(logFolder + '/' + file, 'utf-8').split('\n').filter(Boolean);

        actualLines.forEach(l => {
            if (expectedLines === '*') return;
            for (let e of ignoreErrors) {
                if (l.indexOf(e) > 1) return;
            }
            if (!expectedLines
                || Array.isArray(expectedLines) && expectedLines.filter(e => l.indexOf(e) > -1).length === 0
                || !Array.isArray(expectedLines) && l.indexOf(expectedLines) === -1
            ) {
                errors.push('ERROR: Unexpected content in console logs: ' + file + '--> ' + l);
                return;
            }
        });
    });
    if (errors.length) {
        errors.forEach(e => console.log(e));
        process.exit(1);
    } else {
        console.log('INFO: Console Logs Clean.');
        process.exit(0);
    }
});
