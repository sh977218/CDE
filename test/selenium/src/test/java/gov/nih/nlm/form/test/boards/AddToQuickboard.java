package gov.nih.nlm.form.test.boards;

import gov.nih.nlm.cde.test.boards.BoardTest;
import gov.nih.nlm.system.NlmCdeBaseTest;
import org.openqa.selenium.By;
import org.testng.annotations.Test;

public class AddToQuickboard extends BoardTest {

    @Test
    public void addToQuickBoard() {
        mustBeLoggedInAs(formboarduser, password);
        goToBoard("TestQuickboard");
        textPresent("QUICK BOARD (0)");
        clickElement(By.id("addToCompare_0"));
        textPresent("QUICK BOARD (1)");
        clickElement(By.id("menu_qb_link"));
        clickElement(By.id("formQuickBoard"));
        clickElement(By.linkText("Walking Speed"));
    }

}
