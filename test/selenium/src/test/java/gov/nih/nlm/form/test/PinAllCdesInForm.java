package gov.nih.nlm.form.test;

import gov.nih.nlm.cde.test.boards.BoardTest;
import org.openqa.selenium.By;
import org.testng.Assert;
import org.testng.annotations.Test;

public class PinAllCdesInForm extends BoardTest {

    @Test
    public void pinAllCdesInForm() {
        String formName = "Imaging OCT Analysis -Cirrus Macular Thickness";
        String boardName = "Pin All CDEs From Form";

        mustBeLoggedInAs(pinAllBoardUser_username, password);
        goToFormByName(formName);
        clickElement(By.id("pinAllCdes"));
        clickElement(By.xpath("//*[@id='" + boardName + "']//div[contains(@class,'card-header')]"));
        checkAlert("All elements pinned");
        waitForESUpdate();

        gotoMyBoards();
        Assert.assertEquals(findElement(By.xpath("//div[@id='boardDiv_" + boardName + "']//span[contains(@id,'board_num_cdes_')]")).getText(), "7");
        goToBoard(boardName);
        textPresent("Optical coherence");
    }

}
