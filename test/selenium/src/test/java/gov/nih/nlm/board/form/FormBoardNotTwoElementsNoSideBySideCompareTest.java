package gov.nih.nlm.board.form;

import gov.nih.nlm.board.cde.BoardTest;
import org.openqa.selenium.By;
import org.testng.annotations.Test;

public class FormBoardNotTwoElementsNoSideBySideCompareTest extends BoardTest {

    @Test
    public void formBoardNotTwoElementsNoSideBySideCompare() {
        String formName1 = "Family History - SMA";
        String formName2 = "Anatomical Functional Imaging";
        String formName3 = "Tinnitus Functional Index (TFI)";
        String boardName = "Form Compare Board";
        mustBeLoggedInAs(boarduser1_username, password);
        createBoard(boardName, "Test Compare", "form");
        pinFormToBoard(formName1, boardName);
        pinFormToBoard(formName2, boardName);
        pinFormToBoard(formName3, boardName);
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