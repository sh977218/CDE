package gov.nih.nlm.system.loggers;

import gov.nih.nlm.system.NlmCdeBaseTest;
import org.openqa.selenium.By;
import org.testng.annotations.Test;

public class LogErrorsTest extends NlmCdeBaseTest {

    @Test
    public void logErrorsTest() {
        mustBeLoggedInAs(nlm_username, nlm_password);
        driver.get(baseUrl + "/server/log/triggerServerErrorExpress");
        textPresent("received");

        driver.get(baseUrl + "/siteAudit?tab=serverErrors");
        textPresent("ReferenceError: trigger is not defined");
        textPresent("/triggerServerErrorExpress");

        driver.get(baseUrl + "/siteAudit?tab=clientErrors");
        textPresent("Agent");
        textPresent("URL");
    }
}
