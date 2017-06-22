const u = require('../../../../../test/protractor/tests/testUtils');

describe('formTermMapping', () => {

    it('should let me add desc', () => {
        u.mustBeLoggedInAs('nlm', 'nlm');

        // Written Verbal Fluency Test
        browser.get("/formView?tinyId=QklqIkSrKx");
        element(by.id("addTermMap")).click();
        element(by.id("mesh.search")).sendKeys("fingers");
        // get rid of autocomplete
        element(by.xpath("//label[@for='mesh.search']")).click();
        u.textPresent("D005385 -- Fingers");
        element(by.id("addMeshDescButton")).click();
        element(by.id("closeModal")).click();
        u.textPresent("Saved");
        u.closeAlert();
        u.textPresent("D005385 -- Fingers");

        // check can't add dups
        element(by.id("addTermMap")).click();
        element(by.id("mesh.search")).sendKeys("fingers");
        // get rid of autocomplete
        element(by.xpath("//label[@for='mesh.search']")).click();
        u.textPresent("D005385 -- Fingers");

        // verify it's disabled
        element(by.xpath("//button[@disabled and @id='addMeshDescButton']")).click();

    });

});