package gov.nih.nlm.quickBoard.form;

import gov.nih.nlm.system.NlmCdeBaseTest;
import org.openqa.selenium.By;
import org.testng.annotations.Test;

public class FormSideBySideIds extends NlmCdeBaseTest {

    @Test
    public void formSideBySideIds() {
        driver.get(baseUrl + "/form/search?q=7JUBzySHFg");
        clickElement(By.id("addToCompare_0"));
        checkAlert("Added to QuickBoard!");

        driver.get(baseUrl + "/form/search?q=my7rGyrBYx");
        clickElement(By.id("addToCompare_0"));
        checkAlert("Added to QuickBoard!");

        goToQuickBoardByModule("form");
        clickElement(By.id("qb_compare"));
        textPresent("F0919");
        textPresent("F0954");
    }

}
