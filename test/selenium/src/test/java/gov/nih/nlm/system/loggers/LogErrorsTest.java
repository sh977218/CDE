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

        goHome();
        goToAudit();
        goToServerLog();
        textPresent("ReferenceError: trigger is not defined");
        textPresent("/triggerServerErrorExpress");
    }

    @Test
    public void goToClientErrorsTabServer() {
        mustBeLoggedInAs(nlm_username, nlm_password);
        driver.get(baseUrl + "/siteAudit?tab=serverErrors");
        textPresent("Request");
        textPresent("Stack");
    }

}
