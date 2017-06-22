const u = require('../../../../../test/protractor/tests/testUtils');

describe('formTermMapping', () => {

    it ('should let me delete desc', () => {
        u.mustBeLoggedInAs('nlm', 'nlm');

        // Written Verbal Fluency Test
        browser.get("/formView?tinyId=XyMzLyBHYl");

        u.textPresent("D003710 - Demography");
        u.textPresent("D000328 - Adult");
        u.textPresent("D011795 - Surveys and Questionnaires");

        element(by.xpath("//li[contains(., 'D011795')]//i[@title='Remove Mesh Term']")).click();
        element(by.id("confirmRemoveMesh-2")).click();
        u.textPresent("Saved");
        u.closeAlert();

        u.textPresent("D003710 - Demography");
        u.textPresent("D000328 - Adult");
        u.textPresent("D011795 - Surveys and Questionnaires");
    });

});