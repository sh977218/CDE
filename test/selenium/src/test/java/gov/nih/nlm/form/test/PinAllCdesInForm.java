package gov.nih.nlm.form.test;

import gov.nih.nlm.cde.test.boards.BoardTest;
import gov.nih.nlm.system.NlmCdeBaseTest;
import org.openqa.selenium.By;
import org.testng.Assert;
import org.testng.annotations.Test;

public class PinAllCdesInForm extends NlmCdeBaseTest {

    private BoardTest boardTest = new BoardTest();

    @Test
    public void pinAllCdesInForm() {
        String boardName = "Pin All CDEs From Form";
        mustBeLoggedInAs(pinAllBoardUser_username, password);
        goToFormByName("Imaging OCT Analysis -Cirrus Macular Thickness");
        clickElement(By.id("pinAllCdes"));
        clickElement(By.linkText(boardName));
        textPresent("All elements pinned");
        closeAlert();
        boardTest.gotoMyBoards();
        Assert.assertEquals(findElement(By.xpath("//div[@data-id=\"boardDiv_" + boardName +
                "\"]//dd[contains(@id,'dd_numb_')]")).getText(), "7");
        clickElement(By.xpath("//div[@data-id=\"boardDiv_" + boardName + "\"]//a"));
        textPresent("Optical coherence");
        boardTest.removeBoard(boardName);
    }

}
