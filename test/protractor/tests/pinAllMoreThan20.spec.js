const u = require('./testUtils');
const b = require('./boardUtils');

describe('Pin All', () => {

    it ('should pin more than 20', () => {

            browser.driver.manage().window().maximize();
            browser.get("");


        let board_name = "Pin All More Than 20 Test Board";
        u.mustBeLoggedInAs("pinAllBoardUser", "pass");

        browser.get("/cde/search");

        element(by.id("browseOrg-NINDS")).click();
        element(by.id("li-blank-Disease")).click();
        element(by.xpath("//*[@id='li-blank-Amyotrophic Lateral Sclerosis']")).click();
        element(by.id("li-blank-Classification")).click();
        element(by.id("li-blank-Core")).click();

       element(by.id("searchResultNum")).getText().then((text) => {
           expect(Number(text)).toBeGreaterThan(20);
           element(by.id("pinAll")).click();
           u.textPresent("Choose a Board to pin");
           element(by.xpath("//*[@id='viewBoard_" + board_name + "']")).click();
           u.textPresent("All elements pinned.");
           u.closeAlert();
           b.goToMyBoards();
           element(by.xpath("//*[@data-id = 'boardDiv_"
                + board_name + "']//*[contains(@id, 'board_num_cdes_')]")).getText().then((text2) => {
                expect(text).toEqual(text2);
           })
        });
    });
});