package gov.nih.nlm.board.form;

import gov.nih.nlm.board.cde.BoardTest;
import org.openqa.selenium.By;
import org.openqa.selenium.Keys;
import org.testng.annotations.Test;

public class AddToQuickboard extends BoardTest {

    @Test
    public void addToQuickBoard() {
        mustBeLoggedInAs(formboarduser, password);
        goToBoard("TestQuickboard");
        clickElement(By.id("boardsMenu"));
        textPresent("Quick Board (0)");
        findElement(By.cssSelector("#menu_qb_link")).sendKeys(Keys.ESCAPE);
        clickElement(By.id("addToCompare_0"));
        clickElement(By.id("boardsMenu"));
        textPresent("Quick Board (1)");
        clickElement(By.id("menu_qb_link"));
        clickElement(By.xpath("//div[contains(., 'Form QuickBoard') and contains(@class, 'mat-tab-label-content')]"));
        clickElement(By.linkText("Walking Speed"));
    }

}
