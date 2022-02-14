package gov.nih.nlm.form.test;

import gov.nih.nlm.board.cde.BoardTest;
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
        clickElement(By.xpath("//*[@id='" + boardName + "']//mat-card-title"));
        checkAlert("All elements pinned");
        waitForESUpdate();

        gotoMyBoards();
        int numElement = getNumberElementsByBoardName(boardName);
        Assert.assertEquals(numElement, 7);
        goToBoard(boardName);
        textPresent("Optical coherence");
    }

}
