package gov.nih.nlm.cde.test.boards;

import org.openqa.selenium.By;
import org.testng.annotations.Test;

public class RemoveBoardTest extends BoardTest {
    @Test
    public void removeBoard() {
        mustBeLoggedInAs(boardUser, password);
        String boardName = "Remove me board";
        gotoMyBoards();
        clickElement(By.xpath("//*[@id='boardDiv_" + boardName + "']//*[contains(@id,'removeBoard-')]"));
        textPresent("Confirm Delete");
        clickElement(By.xpath("//*[@id='boardDiv_" + boardName + "']//*[contains(@id,'confirmRemove-')]"));
        textPresent("Done");
        closeAlert();
        textNotPresent(boardName);
    }
}