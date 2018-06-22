package gov.nih.nlm.form.test.boards;

import gov.nih.nlm.cde.test.boards.BoardTest;
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
    }

}
