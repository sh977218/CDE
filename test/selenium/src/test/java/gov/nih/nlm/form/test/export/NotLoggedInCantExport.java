package gov.nih.nlm.form.test.export;

import gov.nih.nlm.system.NlmCdeBaseTest;
import org.openqa.selenium.By;
import org.testng.annotations.Test;

public class NotLoggedInCantExport extends NlmCdeBaseTest {

    @Test
    public void notLoggedInCantExport() {
        mustBeLoggedOut();
        goToFormSearch();
        clickElement(By.id("export"));
        textPresent("Please login to export forms");

        goToFormByName("McGill Quality of Life Questionnaire (MQOL)");
        clickElement(By.id("export"));
        textPresent("Please login to export forms");

    }

}
