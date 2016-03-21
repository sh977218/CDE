package gov.nih.nlm.cde.test.boards;

import gov.nih.nlm.system.NlmCdeBaseTest;
import org.openqa.selenium.By;
import org.testng.annotations.Test;

public class BoardClassification extends NlmCdeBaseTest {

    @Test
    public void classifyAllCdes() {
        mustBeLoggedInAs("classifyBoardUser", password);
        clickElement(By.id("boardsMenu"));
        clickElement(By.id("myBoardsLink"));
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
