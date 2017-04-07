package gov.nih.nlm.cde.test.properties;

import gov.nih.nlm.system.NlmCdeBaseTest;
import org.openqa.selenium.By;
import org.testng.annotations.Test;

public class CdeNoPropertyKeyTest extends NlmCdeBaseTest {

    @Test
    public void cdeNoPropertyKey() {
        String cdeName = "Neoadjuvant Therapy";
        mustBeLoggedInAs(nlm_username, nlm_password);
        goToCdeByName(cdeName);

        clickElement(By.id("properties_tab"));
        clickElement(By.id("openNewPropertyModalBtn"));
        textPresent("No valid property keys present, have an Org Admin go to Org Management > List Management to add one");
    }

}
