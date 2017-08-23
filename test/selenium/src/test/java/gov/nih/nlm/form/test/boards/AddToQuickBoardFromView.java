package gov.nih.nlm.form.test.boards;

import gov.nih.nlm.system.NlmCdeBaseTest;
import org.openqa.selenium.By;
import org.testng.annotations.Test;

public class AddToQuickBoardFromView extends NlmCdeBaseTest {

    @Test
    public void addToQuickBoardFromView() {
        textPresent("Quick Board (0)");
        goToFormByName("Vessel Imaging Angiography");
        clickElement(By.id("addToQuickBoard"));
        textPresent("Quick Board (1)");
        clickElement(By.id("menu_qb_link"));
        clickElement(By.id("formQuickBoard"));
        clickElement(By.linkText("Vessel Imaging Angiography"));
    }


}
