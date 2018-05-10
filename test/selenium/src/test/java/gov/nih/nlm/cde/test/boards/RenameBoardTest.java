package gov.nih.nlm.cde.test.boards;

import org.openqa.selenium.By;
import org.testng.annotations.Test;

public class RenameBoardTest extends BoardTest {
    @Test
    public void renameBoard() {
        mustBeLoggedInAs(boardUser, password);
        String boardName = "Cerebral Palsy";
        gotoMyBoards();
        clickElement(By.xpath("//*[@id='viewBoard_Cerebral Palsy']//i[contains(@class,'editBoard')]"));
        findElement(By.id("boardName")).sendKeys(" NEW");
        clickElement(By.id("saveEditBoardBtn"));
        textPresent(boardName + " NEW");
    }
}