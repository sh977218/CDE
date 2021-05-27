package gov.nih.nlm.board.cde;

import org.openqa.selenium.By;
import org.testng.annotations.Test;

public class CdeBoardSideBySideCompareTest extends BoardTest{
    @Test
    public void cdeBoardSideBySideCompare() {
        String cdeName1 = "cdeCompare1";
        String cdeName2 = "cdeCompare2";
        String boardName = "CDE Compare Board";
        mustBeLoggedInAs(testEditor_username, password);
        createBoard(boardName, "Test Compare", "cde");
        pinCdeToBoard(cdeName1, boardName);
        pinCdeToBoard(cdeName2, boardName);
        goToBoard(boardName);
        clickElement(By.id("elt_compare_0"));
        clickElement(By.id("elt_compare_1"));
        clickElement(By.id("qb_compare"));

        textPresent("TEST", By.xpath(getSideBySideXpath("left", "steward", "fullmatch", 1)));
        textPresent("TEST", By.xpath(getSideBySideXpath("right", "steward", "fullmatch", 1)));
        textPresent("Incomplete", By.xpath(getSideBySideXpath("left", "status", "fullmatch", 1)));
        textPresent("Incomplete", By.xpath(getSideBySideXpath("right", "status", "fullmatch", 1)));

        textPresent("cdeCompare1", By.xpath(getSideBySideXpath("left", "designation", "notmatch", 1)));
        textPresent("cdeCompare2", By.xpath(getSideBySideXpath("right", "designation", "notmatch", 1)));

        textPresent("reference document title 1", By.xpath(getSideBySideXpath("left", "reference documents", "notmatch", 1)));
        textPresent("reference document title 2", By.xpath(getSideBySideXpath("right", "reference documents", "notmatch", 1)));

        textPresent("key 1", By.xpath(getSideBySideXpath("left", "properties", "notmatch", 1)));
        textPresent("key 2", By.xpath(getSideBySideXpath("right", "properties", "notmatch", 1)));

        textPresent("concept name 1", By.xpath(getSideBySideXpath("left", "data element concept", "notmatch", 1)));
        textPresent("concept name 2", By.xpath(getSideBySideXpath("right", "data element concept", "notmatch", 1)));
        clickElement(By.id("closeCompareSideBySideBtn"));

        gotoMyBoards();

        clickElement(By.xpath("//*[@id='" + boardName + "']//*[contains(@class,'deleteBoard')]"));
        clickElement(By.id("saveDeleteBoardBtn"));
        checkAlert("Deleted.");
        textNotPresent(boardName);
    }
}
