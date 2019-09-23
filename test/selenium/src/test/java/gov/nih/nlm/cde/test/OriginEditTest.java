package gov.nih.nlm.cde.test;

import gov.nih.nlm.system.NlmCdeBaseTest;
import org.openqa.selenium.By;
import org.testng.Assert;
import org.testng.annotations.Test;

public class OriginEditTest extends NlmCdeBaseTest {

    @Test
    void originEdit() {
        mustBeLoggedInAs(nlm_username, nlm_password);
        goToCdeByName("Person Gender Text Type");
        String origin = "this is new origin.";
        inlineEdit("//*[@id='origin']", origin);
        newCdeVersion();
        textPresent(origin, By.id("origin"));
    }

}
