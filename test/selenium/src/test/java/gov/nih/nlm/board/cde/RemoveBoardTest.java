package gov.nih.nlm.board.cde;

import org.openqa.selenium.By;
import org.testng.annotations.Test;

public class RemoveBoardTest extends BoardTest {
    @Test
    public void removeBoard() {
        String boardName = "Remove me board";
        mustBeLoggedInAs(boardUser, password);
        gotoMyBoards();
        clickElement(By.xpath("//*[@id='" + boardName + "']//*[contains(@class,'deleteBoard')]"));
        clickElement(By.id("saveDeleteBoardBtn"));
        checkAlert("Deleted.");
        textNotPresent(boardName);
    }

}