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
        boardTest.createBoard(boardName, "Descriptions are cool.");
        goToFormByName("Imaging OCT Analysis -Cirrus Macular Thickness");
        findElement(By.id("pinAllCdes")).click();
        findElement(By.linkText(boardName)).click();
        textPresent("All elements pinned");
        closeAlert();
        boardTest.gotoMyBoards();
        Assert.assertEquals(findElement(By.xpath("//div[@data-id=\"boardDiv_" + boardName + "\"]//dd[@id='dd_numb_0']")).getText(), "7");
        findElement(By.xpath("//div[@data-id=\"boardDiv_" + boardName + "\"]//a")).click();
        textPresent("Optical coherence");
        boardTest.removeBoard(boardName);
    }

}
