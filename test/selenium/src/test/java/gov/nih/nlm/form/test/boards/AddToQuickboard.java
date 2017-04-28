package gov.nih.nlm.form.test.boards;

import gov.nih.nlm.cde.test.boards.BoardTest;
import gov.nih.nlm.system.NlmCdeBaseTest;
import org.openqa.selenium.By;
import org.testng.annotations.Test;

public class AddToQuickboard extends BoardTest {

    @Test
    public void addToQuickBoard() {
        goToBoard("TestQuickboard");
        textPresent("Quick Board (0)");
        clickElement(By.id("addToCompare_0"));
        textPresent("Quick Board (1)");
        clickElement(By.id("menu_qb_link"));
        clickElement(By.id("qb_form_tab"));
        clickElement(By.linkText("Walking Speed"));
    }

}
