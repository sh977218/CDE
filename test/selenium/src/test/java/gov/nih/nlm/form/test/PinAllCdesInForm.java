package gov.nih.nlm.form.test.properties.test;

import gov.nih.nlm.cde.test.boards.BoardTest;
import org.openqa.selenium.By;
import org.testng.Assert;
import org.testng.annotations.Test;

public class PinAllCdesInForm extends BoardTest {

    @Test
    public void pinAllCdesInForm() {
        String boardName = "Pin All CDEs From Form";
        mustBeLoggedInAs(pinAllBoardUser_username, password);
        goToFormByName("Imaging OCT Analysis -Cirrus Macular Thickness");
        clickElement(By.id("pinAllCdes"));
        clickElement(By.linkText(boardName));
        textPresent("All elements pinned");
        closeAlert();
        waitForESUpdate();

        gotoMyBoards();
        Assert.assertEquals(findElement(By.xpath("//div[@data-id='boardDiv_" + boardName + "']//span[contains(@id,'board_num_cdes_')]")).getText(), "7");
        goToBoard(boardName);
        textPresent("Optical coherence");
    }

}
