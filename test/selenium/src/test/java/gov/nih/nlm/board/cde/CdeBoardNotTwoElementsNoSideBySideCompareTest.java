package gov.nih.nlm.board.cde;

import org.openqa.selenium.By;
import org.testng.annotations.Test;

public class CdeBoardNotTwoElementsNoSideBySideCompareTest extends BoardTest {
    @Test
    public void cdeBoardNotTwoElementsNoSideBySideCompare() {
        String cdeName1 = "Fluorescence in situ Hybridization Anaplastic Lymphoma Kinase Calculation Standard Deviation Value";
        String cdeName2 = "Recurrent Malignant Neoplasm Patient No Cisplatin Interval Month Count";
        String cdeName3 = "Prior BMSCT Administered Indicator";
        String boardName = "CDE Compare Board";
        mustBeLoggedInAs(boarduser1_username, password);
        createBoard(boardName, "Test Compare", "cde");
        pinCdeToBoardWithModal(cdeName1, boardName);
        pinCdeToBoardWithModal(cdeName2, boardName);
        pinCdeToBoardWithModal(cdeName3, boardName);
        goToBoard(boardName);
        clickElement(By.id("elt_compare_0"));
        clickElement(By.id("qb_compare"));
        textPresent("Please select only two elements to compare.");

        clickElement(By.id("elt_compare_1"));
        clickElement(By.id("elt_compare_2"));
        clickElement(By.id("qb_compare"));
        textPresent("Please select only two elements to compare.");

        gotoMyBoards();

        clickElement(By.xpath("//*[@id='" + boardName + "']//*[contains(@class,'deleteBoard')]"));
        clickElement(By.id("saveDeleteBoardBtn"));
        checkAlert("Deleted.");
        textNotPresent(boardName);
    }
}
