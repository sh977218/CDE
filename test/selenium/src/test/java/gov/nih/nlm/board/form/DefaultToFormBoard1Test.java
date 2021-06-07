package gov.nih.nlm.board.form;

import gov.nih.nlm.board.cde.BoardTest;
import org.openqa.selenium.By;
import org.testng.annotations.Test;

public class DefaultToFormBoard1Test extends BoardTest {

    @Test
    public void createDefaultFormBoard() {
        mustBeLoggedInAs(boarduser2_username, password);
        String formName1 = "ER/Admission Therapeutic Procedures";
        String formName2 = "Parkinson's Disease Quality of Life Scale (PDQUALIF)";
        String defaultBoardName = "Board 1";
        goToFormByName(formName1);
        clickElement(By.id("addToBoard"));
        textPresent("Added to new board: " + defaultBoardName);

        goToFormByName(formName2);
        clickElement(By.id("addToBoard"));
        textPresent("Added to " + defaultBoardName);

        goToBoard(defaultBoardName);
        textPresent(formName1);
        textPresent(formName2);

        gotoMyBoards();
        clickElement(By.xpath("//*[@id='" + defaultBoardName + "']//*[contains(@class,'deleteBoard')]"));
        clickElement(By.id("saveDeleteBoardBtn"));
        checkAlert("Deleted.");
        textNotPresent(defaultBoardName);
    }
}
