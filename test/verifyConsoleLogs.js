const logFolder = './build/consolelogs';
const fs = require('fs');

let expectedContent = {
    assignVsacId: 'the server responded with a status of 404',
    badQuery: 'elasticSearch/cde - Failed to load resource: the server responded with a status of 400 (Bad Request)',
    boardFiveUnapprovedMessagesPerUserReply: 'the server responded with a status of 403 (Forbidden)',
    boardPublisher: [
        'the server responded with a status of 403 (Forbidden)',
        'You don\'t have permission to make boards public!'
    ],
    cdeAddClassification: 'addCdeClassification/ - Failed to load resource: the server responded with a status of 409 (Conflict)',
    cdeLiveCommentTest: '*',
    cdeTinyIdSwaggerApi: 'docs/swagger-ui-bundle.js 51:49866 "Could not find component"',
    cdeTinyIdVersionSwaggerApi: 'docs/swagger-ui-bundle.js 51:49866 "Could not find component"',
    checkDuplicatesClassification: 'the server responded with a status of 409',
    dupStewardValidation: [
        "Error publishing DataElement validation failed",
        "422 (Unprocessable Entity)"
        ],
    embedNinds: '*',
    emptyAnswers: 'the server responded with a status of 500',
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
    formTinyIdSwaggerApi: 'docs/swagger-ui-bundle.js 51:49866 "Could not find component"',
    formTinyIdVersionSwaggerApi: 'docs/swagger-ui-bundle.js 51:49866 "Could not find component"',
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
    report: 'cde/search 0:0 Uncaught SyntaxError: Unexpected token <',
    resourcesPage: 'Content Security Policy',
    searchPageSize: 'the server responded with a status of 400 (Bad Request)',
    tooManyBoards: [
        'board - Failed to load resource: the server responded with a status of 403 (Forbidden)',
        'You have too many boards!'
    ],
    wrongLogin: 'login - Failed to load resource: the server responded with a status of 403'
};

let ignoreErrors = ['Slow network is detected', 'Report Only', 'reportOnly', 'Failed to decode downloaded font'];

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
