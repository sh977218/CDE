const logFolder = './build/consolelogs';
const fs = require('fs');

let expectedContent = {
    "assignVsacId": "vsacBridge/invalidId - Failed to load resource: the server responded with a status of 500 (Internal Server Error)",
    "badQuery": "elasticSearch/cde - Failed to load resource: the server responded with a status of 400 (Bad Request)",
    "boardPublisher": "board - Failed to load resource: the server responded with a status of 403 (Forbidden)",
    "cdeAddClassification": "addCdeClassification/ - Failed to load resource: the server responded with a status of 409 (Conflict)",
    "cdeLiveCommentTest": "WARNING https://www.nlm.nih.gov/cde/ - The SSL certificate used to load resources from https://dnn506yrbagrg.cloudfront.net",
    "cdeTinyIdSwaggerApi": "docs/swagger-ui-bundle.js 51:49866 \"Could not find component\"",
    "cdeTinyIdVersionSwaggerApi": "docs/swagger-ui-bundle.js 51:49866 \"Could not find component\"",
    "checkDuplicatesClassification": "addCdeClassification/ - Failed to load resource: the server responded with a status of 409 (Conflict)",
    "declineComment": "comments/decline - Failed to load resource: the server responded with a status of 404 (Not Found)",
    "embedNinds": "orgaccountmanagement - [DOM] Input elements should have autocomplete attributes",
    "formTinyIdSwaggerApi": "docs/swagger-ui-bundle.js 51:49866 \"Could not find component\"",
    "formTinyIdVersionSwaggerApi": "docs/swagger-ui-bundle.js 51:49866 \"Could not find component\"",
    "logClientErrors": "*",
    "importPv": "deView?tinyId=mJQiShWEW - Form submission canceled because the form is not connected",
    "meshTopics": "classificationmanagement - Form submission canceled because the form is not connected",
    "pageNotFound": "de/abc - Failed to load resource: the server responded with a status of 404 (Not Found)",
    "publicVsPrivateBoards": "board/5750474d89949d54384ee640/0 - Failed to load resource: the server responded with a status of",
    "report": "cde/search 0:0 Uncaught SyntaxError: Unexpected token <",
    "searchPageSize": "elasticSearch/cde - Failed to load resource: the server responded with a status of 400 (Bad Request)",
    "tooManyBoards": "board - Failed to load resource: the server responded with a status of 403 (Forbidden)",
    "wrongLogin": "login - Failed to load resource: the server responded with a status of 403"
}

let errors = [];

fs.readdirSync(logFolder).forEach(file => {

    let expectedLines = expectedContent[file.split("_")[0]];
    if (!expectedLines) errors.push("ERROR: Unexpected file in console logs: " + file);
    else {
        let actualLines = fs.readFileSync(logFolder + "/" + file, 'utf-8').split("\n").filter(Boolean);

        actualLines.forEach(l => {
            if (expectedLines !== "*" && l.indexOf(expectedLines) === -1 && l.indexOf("Slow network is detected") === "-1") {
                errors.push("ERROR: Unexpected content in console logs: " + file + "--> " + l);
            }
        });

    }

});

if (errors.length) {
    errors.forEach(e => console.log(e));
    process.exit(1);
} else {
    console.log("INFO: Console Logs Clean.");
    process.exit(0);
}

