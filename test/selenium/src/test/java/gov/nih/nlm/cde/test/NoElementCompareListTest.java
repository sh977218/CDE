package gov.nih.nlm.cde.test;


import gov.nih.nlm.system.NlmCdeBaseTest;
import org.openqa.selenium.By;
import org.testng.annotations.Test;

public class NoElementCompareListTest extends NlmCdeBaseTest {

    @Test
    public void noElementCompareList() {
        goToCdeSearch();
        clickElement(By.id("boardsMenu"));
        clickElement(By.id("menu_qb_link"));
        textPresent("The quick board is empty.");
    }

}
