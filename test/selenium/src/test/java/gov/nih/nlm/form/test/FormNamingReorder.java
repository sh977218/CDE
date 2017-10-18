package gov.nih.nlm.form.test;

import gov.nih.nlm.system.NlmCdeBaseTest;
import org.openqa.selenium.By;
import org.testng.annotations.Test;

public class FormNamingReorder extends NlmCdeBaseTest {

    @Test
    public void formReorderNamingTest() {
        mustBeLoggedInAs(testAdmin_username, password);
        goToFormByName("form for test cde reorder detail tabs");
        goToNaming();
        textPresent("Definition:");
        clickElement(By.id("moveDown-0"));
        textPresent("form for test cde reorder detail tabs", By.id("designation_1"));
        clickElement(By.id("moveUp-2"));
        textPresent("form for test cde reorder detail tabs 3", By.id("designation_1"));
        clickElement(By.id("moveTop-2"));
        textPresent("form for test cde reorder detail tabs", By.id("designation_0"));
    }
}
