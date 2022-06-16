package gov.nih.nlm.board.form;

import gov.nih.nlm.board.cde.BoardTest;
import org.openqa.selenium.By;
import org.testng.annotations.Test;

public class AddToBoardFromView extends BoardTest{

    @Test
    public void addToBoardFromView() {
        mustBeLoggedInAs(formboarduser, password);
        goToFormByName("Vessel Imaging Angiography");
        clickElement(By.id("addToBoard"));
        textPresent("TestQuickboard");
        clickCancelButton();

        clickElement(By.id("addToBoard"));
        clickElement(By.cssSelector("#AddFormBoard mat-card-title"));
        checkAlert("Pinned to AddFormBoard");

        gotoMyBoards();
        textPresent("1 Form", By.id("AddFormBoard"));
    }

}
