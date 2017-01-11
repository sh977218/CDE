package gov.nih.nlm.cde.test.boards;

import org.openqa.selenium.By;
import org.testng.annotations.Test;

public class RenameBoardTest extends BoardTest {
    @Test
    public void renameBoard() {
        mustBeLoggedInAs(boardUser, password);
        String boardName = "Cerebral Palsy";
        gotoMyBoards();
        clickElement(By.xpath("//*[@id='viewBoard_Cerebral Palsy']//i"));
        textPresent("Confirm");
        findElement(By.xpath("//*[@id='viewBoard_Cerebral Palsy']//input")).sendKeys(" NEW");
        clickElement(By.xpath("//*[@id='viewBoard_Cerebral Palsy']//button[contains(text(),'Confirm')]"));
        closeAlert();
        textPresent(boardName + " NEW");
    }
}