package gov.nih.nlm.system.loggers;

import gov.nih.nlm.system.NlmCdeBaseTest;
import gov.nih.nlm.system.SelectBrowser;
import org.openqa.selenium.By;
import org.testng.annotations.Test;

public class LogClientErrors extends NlmCdeBaseTest {

    @Test
    public void goToClientErrorsTabClient() {
        mustBeLoggedInAs(nlm_username, nlm_password);
        driver.get(baseUrl + "/siteAudit?tab=clientErrors");
        textPresent("Agent");
        textPresent("URL");
    }

}
