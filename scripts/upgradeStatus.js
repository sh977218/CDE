const webdriverio = require('webdriverio');
const options = { desiredCapabilities: { browserName: 'firefox' } };
const client = webdriverio.remote(options);

const baseUrl = "http://localhost:3001";

async function init () {
    return client.init()
        .url(baseUrl)
        .timeouts('implicit', 5000);
}


async function login () {
    return client
        .waitForExist("#login_link")
        .click('#login_link')
        .waitForExist('#uname')
        .setValue('#uname', "nlm")
        .setValue('#passwd', "nlm")
        .click("#login_button")
        .waitForExist('#createEltLink');

}

async function updateOneStatus () {
    return client.url(baseUrl + '/cde/search?regStatuses=Incomplete&selectedOrg=NEI&classification=LASIK%20Quality%20of%20Life%20Collaboration%20Project;Pre-Operative')
        .waitForExist("#linkToElt_0")
        .click("#linkToElt_0")
        .waitForExist("#editStatus")
        .click("#editStatus")
        .selectByValue("#newRegistrationStatus", "Qualified")
        .click("#saveRegStatus")
        .click("#openSave")
        .click("#confirmSaveBtn")
        .waitForExist("div.alert button.close")
        .click("div.alert button.close")
        ;

}

async function runScript () {
    await init();
    await login();
    while (true) {
        await updateOneStatus();
    }
    client.end();
}

runScript();




