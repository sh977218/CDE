package gov.nih.nlm.cde.test.boards;

import org.openqa.selenium.By;
import org.testng.annotations.Test;

public class BoardClassification extends BoardTest {

    @Test
    public void classifyAllCdes() {
        mustBeLoggedInAs(classifyBoardUser_username, password);
        gotoMyBoards();
        clickElement(By.id("viewBoard_Classify Board"));
        clickElement(By.id("board.classifyAll"));
        clickElement(By.xpath("//div[span/text() = 'Classify Board']/button"));
        textPresent("Elements classified");
        closeAlert();
        clickElement(By.linkText("Manual muscle testing date and time"));
        clickElement(By.id("classification_tab"));
        findElement(By.linkText("Classify Board"));
    }

}
