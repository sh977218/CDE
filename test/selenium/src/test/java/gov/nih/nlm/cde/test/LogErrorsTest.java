package gov.nih.nlm.cde.test;

import gov.nih.nlm.system.NlmCdeBaseTest;
import org.openqa.selenium.By;
import org.testng.annotations.Test;

public class LogErrorsTest extends NlmCdeBaseTest {
    String[] triggerErrorUrls = new String[]{"/server/log/triggerServerErrorExpress",
            "/server/log/triggerServerErrorMongoose",
            "/server/log/triggerClientError"};

    @Test
    public void logErrors() {
        mustBeLoggedInAs(nlm_username, nlm_password);
        for (String triggerErrorUrl : triggerErrorUrls) {
            driver.get(baseUrl + triggerErrorUrl);
            textPresent("received");
        }
        driver.get(baseUrl);
        clickElement(By.id("username_link"));
        clickElement(By.linkText("Audit"));

        clickElement(By.linkText("Server Errors"));

        textPresent("ReferenceError: trigger is not defined");
        textPresent("/triggerServerErrorExpress");

    }
}
