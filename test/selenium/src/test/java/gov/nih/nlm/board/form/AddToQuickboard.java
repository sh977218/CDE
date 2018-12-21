package gov.nih.nlm.board.form;

import gov.nih.nlm.board.cde.BoardTest;
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
        clickElement(By.xpath("//div[contains(., 'Form QuickBoard') and contains(@class, 'mat-tab-label-content')]"));
        clickElement(By.linkText("Walking Speed"));
    }

}
