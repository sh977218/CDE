package gov.nih.nlm.cde.test.boards;

import org.openqa.selenium.By;
import org.testng.annotations.Test;

public class BoardClassification extends BoardTest {

    @Test
    public void classifyAllCdes() {
        mustBeLoggedInAs(classifyBoardUser_username, password);
        goToBoard("Classify Board");
        clickElement(By.id("board.classifyAllCdes"));
        clickElement(By.xpath("//div[span/text() = 'Classify Board']/button"));
        textPresent("Elements classified");
        closeAlert();
        clickElement(By.linkText("Manual muscle testing date and time"));
        clickElement(By.id("classification_tab"));
        textPresent("Classify Board");
    }

}
