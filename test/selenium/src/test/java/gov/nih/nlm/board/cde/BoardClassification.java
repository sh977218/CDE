package gov.nih.nlm.board.cde;

import org.openqa.selenium.By;
import org.testng.annotations.Test;

public class BoardClassification extends BoardTest {

    @Test
    public void classifyAllCdes() {
        mustBeLoggedInAs(classifyBoardUser_username, password);
        goToBoard("Classify Board");
        clickElement(By.id("board.classifyAllCdes"));
        classifySubmit(new String[]{"Classify Board"}, "Elements classified");
        clickElement(By.linkText("Manual muscle testing date and time"));
        goToClassification();
        textPresent("Classify Board");
    }

}
