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
        clickElement(By.id("cancelSelect"));

        clickElement(By.id("addToBoard"));
        clickElement(By.id("AddFormBoard"));

    }

}
