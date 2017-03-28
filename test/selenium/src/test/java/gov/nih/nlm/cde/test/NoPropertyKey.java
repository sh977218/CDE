package gov.nih.nlm.cde.test;

import gov.nih.nlm.system.NlmCdeBaseTest;
import org.openqa.selenium.By;
import org.testng.annotations.Test;

public class NoPropertyKey extends NlmCdeBaseTest {

    @Test
    public void noPropertyKey() {
        mustBeLoggedInAs(nlm_username, nlm_password);
        goToCdeByName("Neoadjuvant Therapy");

        clickElement(By.id("properties_tab"));
        clickElement(By.id("openNewPropertyModalBtn"));
        textPresent("No valid property keys present, have an Org Admin go to Org Management > List Management to add one");
    }

}
