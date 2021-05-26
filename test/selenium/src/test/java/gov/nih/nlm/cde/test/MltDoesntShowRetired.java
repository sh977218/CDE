package gov.nih.nlm.cde.test;

import gov.nih.nlm.system.NlmCdeBaseTest;
import org.openqa.selenium.By;
import org.testng.annotations.Test;

public class MltDoesntShowRetired extends NlmCdeBaseTest {

    @Test
    public void mltDoesntShowRetired() {
        // data has 2, one is retired
        String cdeName = "MltTest";
        mustBeLoggedInAs(ctepEditor_username, password);
        goToCdeByName(cdeName);

        clickElement(By.id("mltButton"));
        textNotPresent(cdeName, By.id("mltAccordion"));
    }
}
