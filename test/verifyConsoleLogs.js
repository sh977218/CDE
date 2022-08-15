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
    cantEditInCompare: '/server/uts/vsacBridge/invalidId - Failed to load resource: the server responded with a status of 404 (Not Found)',
    cantViewOthersBoards: [
        'Board Not Found',
        'Failed to load resource: the server responded with a status of 404 (Not Found)'
    ],
    cannotCreateDuplicateUser: 'the server responded with a status of 409 (Conflict)',
    cdeAddClassification: 'addCdeClassification/ - Failed to load resource: the server responded with a status of 409 (Conflict)',
    cdeChangeDefinitionFormat: '*', // ckeditor
    cdeLiveCommentTest: '*',
    cdeTinyIdSwaggerApi: [
        'docs/swagger-ui-bundle.js 51:49866 "Could not find component"',
        'Unable to get the Swagger UI URL from the server'
    ],
    cdeTinyIdVersionSwaggerApi: [
        'docs/swagger-ui-bundle.js 51:49866 "Could not find component"',
        'Unable to get the Swagger UI URL from the server'
    ],
    cdeTruncatePlainPropertiesTest: '*', // ckeditor
    cdeTruncateRichPropertiesTest: '*', // ckeditor
    checkDuplicatesClassification: 'Failed to load resource: the server responded with a status of 409 (Conflict)',
    codesFromNCI: '/server/uts/umlsPtSource/',
    contactUs: '*', // ckeditor
    createUser: 'with a status of 409',
    dupStewardValidation: [
        "Error publishing DataElement validation failed",
        "422 (Unprocessable Entity)"
    ],
    embedNinds: '*',
    emptyAnswers: 'the server responded with a status of 500',
    formAddCde: '*',
    formHistoryCompareTest: '*',
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
    dynamicCodeListFormTest: 'TypeError: Failed to fetch',
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
    formTruncateRichPropertiesTest: '*', // ckeditor
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
    resourcesPage: '*', // 'Content Security Policy', ckeditor
    searchPageSize: '*',
    tooManyBoards: [
        'board - Failed to load resource: the server responded with a status of 403 (Forbidden)',
        'You have too many boards!'
    ],
    uomValidation: "*",
    validRulesPvUmls: 'Failed to load resource: the server responded with a status of 400 (Bad Request)',
    whatsNew: '*', // ckeditor
    wrongLogin: 'login - Failed to load resource: the server responded with a status of 403',
    youtubeVideo: '*' // 'SameSite', ckeditor
};

let ignoreErrors = [
    ':3001/server/de/originalSource/',
    ':3001/server/form/originalSource/',
    'listbox select is deprecated and will be removed in M79',
    'does not conform to the required format',
    'elements with non-unique id',
    'reportOnly',
    'Report Only',
    'Failed to decode downloaded font',
    'https://script.crazyegg.com/pages/data-scripts',
    'Slow network is detected',
    'WebSocket is already in CLOSING or CLOSED state',
    'petstore.swagger.io',
    "Cannot read property 'nativeElement' of undefined",
    "WebSocket is closed before the connection is established",
    "TypeError: Failed to fetch",
    `Cannot read properties of null (reading `,
    `Cannot read properties of undefined (reading `,
    `because its MIME type ('text/html') is not a supported stylesheet MIME type, and strict MIME checking is enabled.`
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
        let actualLines = fs.readFileSync(logFolder + '/' + file, 'utf-8')
            .split(/(?:Mon|Tue|Wed|Thu|Fri|Sat|Sun)\s(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dev)\s\d{2}\s\d{2}:\d{2}:\d{2}/gm)
            .filter(Boolean);

        actualLines.forEach(l => {
            if (expectedLines === '*') {
                return;
            }
            for (let e of ignoreErrors) {
                if (l.indexOf(e) !== -1) {
                    return;
                }
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
