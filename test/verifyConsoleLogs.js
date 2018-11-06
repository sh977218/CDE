const logFolder = './build/consolelogs';
const fs = require('fs');

let expectedContent = {
    CdeMergeMineTheir: 'Failed to load resource: the server responded with a status of 403 (Forbidden)',
    StandardStatusWarningCheck: 'Failed to load resource: the server responded with a status of 403 (Forbidden)',
    adminCantEditPrefStdCde: 'Failed to load resource: the server responded with a status of 403 (Forbidden)',
    adminCantEditStandardCde: 'Failed to load resource: the server responded with a status of 403 (Forbidden)',
    assignVsacId: 'the server responded with a status of 404',
    badQuery: 'elasticSearch/cde - Failed to load resource: the server responded with a status of 400 (Bad Request)',
    boardFiveUnapprovedMessagesPerUserReply: 'the server responded with a status of 403 (Forbidden)',
    boardPublisher: 'the server responded with a status of 403 (Forbidden)',
    cantEditInCompare: 'Failed to load resource: the server responded with a status of 403 (Forbidden)',
    cdeAddClassification: ['Failed to load resource: the server responded with a status of 403 (Forbidden)',
        'addCdeClassification/ - Failed to load resource: the server responded with a status of 409 (Conflict)'],
    cdeAddCommentNeedApproval: 'Failed to load resource: the server responded with a status of 403 (Forbidden)',
    cdeApproveCommentTest: 'Failed to load resource: the server responded with a status of 403 (Forbidden)',
    cdeAttachment: 'Failed to load resource: the server responded with a status of 403 (Forbidden)',
    cdeBoards: 'Failed to load resource: the server responded with a status of 403 (Forbidden)',
    cdeDeclineCommentTest: 'Failed to load resource: the server responded with a status of 403 (Forbidden)',
    cdeLiveCommentTest: '*',
    cdeLongCommentTest: 'Failed to load resource: the server responded with a status of 403 (Forbidden)',
    cdeRemoveCommentTest: 'Failed to load resource: the server responded with a status of 403 (Forbidden)',
    cdeReopenCommentTest: 'Failed to load resource: the server responded with a status of 403 (Forbidden)',
    cdeReplyNotificationTest: 'Failed to load resource: the server responded with a status of 403 (Forbidden)',
    cdeResolveCommentTest: 'Failed to load resource: the server responded with a status of 403 (Forbidden)',
    cdeTinyIdSwaggerApi: 'docs/swagger-ui-bundle.js 51:49866 "Could not find component"',
    cdeTinyIdVersionSwaggerApi: 'docs/swagger-ui-bundle.js 51:49866 "Could not find component"',
    checkDuplicatesClassification: ['Failed to load resource: the server responded with a status of 403 (Forbidden)',
        'the server responded with a status of 409'],
    classifyAllCdes: 'Failed to load resource: the server responded with a status of 403 (Forbidden)',
    classifyCdesInForm: 'Failed to load resource: the server responded with a status of 403 (Forbidden)',
    codesFromNCI: 'Failed to load resource: the server responded with a status of 403 (Forbidden)',
    curatorCanCopy: 'Failed to load resource: the server responded with a status of 403 (Forbidden)',
    declineCdeAttachment: 'Failed to load resource: the server responded with a status of 403 (Forbidden)',
    editCde: 'Failed to load resource: the server responded with a status of 403 (Forbidden)',
    embedNinds: '*',
    emptyAnswers: 'the server responded with a status of 500',
    findFormByCde: 'Failed to load resource: the server responded with a status of 403 (Forbidden)',
    formAddClassification: 'Failed to load resource: the server responded with a status of 403 (Forbidden)',
    formAddCommentNeedApproval: 'Failed to load resource: the server responded with a status of 403 (Forbidden)',
    formApproveCommentTest: 'Failed to load resource: the server responded with a status of 403 (Forbidden)',
    formAttachments: 'Failed to load resource: the server responded with a status of 403 (Forbidden)',
    formCdeExport: 'Failed to load resource: the server responded with a status of 403 (Forbidden)',
    formCdeWithLinkedFormsExportLong: 'Failed to load resource: the server responded with a status of 403 (Forbidden)',
    formCdeWithLinkedFormsExportShort: 'Failed to load resource: the server responded with a status of 403 (Forbidden)',
    formClassificationAudit: 'Failed to load resource: the server responded with a status of 403 (Forbidden)',
    formDeclineCommentTest: 'Failed to load resource: the server responded with a status of 403 (Forbidden)',
    formFiveUnapprovedMessagesPerUserComment: 'Failed to load resource: the server responded with a status of 403 (Forbidden)',
    formHistory: 'Failed to load resource: the server responded with a status of 403 (Forbidden)',
    formLongCommentTest: 'Failed to load resource: the server responded with a status of 403 (Forbidden)',
    formOneUnapprovedReplyPerUser: 'Failed to load resource: the server responded with a status of 403 (Forbidden)',
    formPermissionTest: 'Failed to load resource: the server responded with a status of 403 (Forbidden)',
    formRemoveCommentTest: 'Failed to load resource: the server responded with a status of 403 (Forbidden)',
    formResolveCommentTest: 'Failed to load resource: the server responded with a status of 403 (Forbidden)',
    formTinyIdSwaggerApi: 'docs/swagger-ui-bundle.js 51:49866 "Could not find component"',
    formTinyIdVersionSwaggerApi: 'docs/swagger-ui-bundle.js 51:49866 "Could not find component"',
    formTotalScore: 'Failed to load resource: the server responded with a status of 403 (Forbidden)',
    formXmlExport: 'Failed to load resource: the server responded with a status of 403 (Forbidden)',
    jsonExport: 'Failed to load resource: the server responded with a status of 403 (Forbidden)',
    logClientErrors: '*',
    meshTopics: 'classificationmanagement - Form submission canceled because the form is not connected',
    multiSubQuestionTest: 'Failed to load resource: the server responded with a status of 403 (Forbidden)',
    noDoublePin: 'Failed to load resource: the server responded with a status of 409 (Conflict)',
    oneLiner: 'Failed to load resource: the server responded with a status of 403 (Forbidden)',
    orgAdminCanEditHisCdes: 'Failed to load resource: the server responded with a status of 403 (Forbidden)',
    pageNotFound: 'de/abc - Failed to load resource: the server responded with a status of 404 (Not Found)',
    phenxCanNotExportRedCap: 'Failed to load resource: the server responded with a status of 403 (Forbidden)',
    pinCdesIntoBoard: 'Failed to load resource: the server responded with a status of 403 (Forbidden)',
    promisCanNotExportRedCap: 'Failed to load resource: the server responded with a status of 403 (Forbidden)',
    publicVsPrivateBoards: 'Failed to load resource: the server responded with a status of',
    publishForm: 'Failed to load resource: the server responded with a status of 403 (Forbidden)',
    regUserCantCopy: 'Failed to load resource: the server responded with a status of 403 (Forbidden)',
    report: 'cde/search 0:0 Uncaught SyntaxError: Unexpected token <',
    reviewerCanCommentOnCdeTest: 'Failed to load resource: the server responded with a status of 403 (Forbidden)',
    sdcRender: 'Failed to load resource: the server responded with a status of 403 (Forbidden)',
    searchPageSize: 'the server responded with a status of 400 (Bad Request)',
    tooManyBoards: 'board - Failed to load resource: the server responded with a status of 403 (Forbidden)',
    viewingHistory: 'Failed to load resource: the server responded with a status of 403 (Forbidden)',
    wgClassificationInvisible: 'Failed to load resource: the server responded with a status of 403 (Forbidden)',
    wgSeesOtherWg: 'Failed to load resource: the server responded with a status of 403 (Forbidden)',
    wrongLogin: 'login - Failed to load resource: the server responded with a status of 403'
};

let errors = [];
let ignoreErrors = ['Slow network is detected', 'Report Only', 'reportOnly', 'Failed to decode downloaded font'];

fs.readdirSync(logFolder).forEach(file => {

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

