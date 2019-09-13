package gov.nih.nlm.board.form;

import gov.nih.nlm.system.NlmCdeBaseTest;
import org.openqa.selenium.By;
import org.testng.annotations.Test;

public class AddToQuickBoardFromView extends NlmCdeBaseTest {

    @Test
    public void addFormToQuickBoardFromView() {
        goToCdeSearch();
        clickElement(By.id("boardsMenu"));
        textPresent("Quick Board (0)");
        goToFormByName("Vessel Imaging Angiography");
        clickElement(By.id("addToQuickBoard"));
        checkAlert("Added to QuickBoard");
        clickElement(By.id("boardsMenu"));
        textPresent("Quick Board (1)");
        clickElement(By.id("menu_qb_link"));
        clickElement(By.xpath("//div[contains(., 'Form QuickBoard') and contains(@class, 'mat-tab-label-content')]"));
        textPresent("30 Questions");
        clickElement(By.linkText("Vessel Imaging Angiography"));
    }

}
