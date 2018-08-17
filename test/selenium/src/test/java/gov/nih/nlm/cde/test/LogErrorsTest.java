package gov.nih.nlm.cde.test;

import gov.nih.nlm.system.NlmCdeBaseTest;
import org.openqa.selenium.By;
import org.testng.annotations.Test;

public class LogErrorsTest extends NlmCdeBaseTest {

    @Test
    public void logErrors() {
        mustBeLoggedInAs(nlm_username, nlm_password);
        driver.get(baseUrl + "/server/log/triggerServerErrorExpress");
        textPresent("received");

        driver.get(baseUrl);
        clickElement(By.id("username_link"));
        clickElement(By.linkText("Audit"));

        clickElement(By.linkText("Server Errors"));

        textPresent("ReferenceError: trigger is not defined");
        textPresent("/triggerServerErrorExpress");

    }
}
