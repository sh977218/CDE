package gov.nih.nlm.system.loggers;

import gov.nih.nlm.system.NlmCdeBaseTest;
import org.openqa.selenium.By;
import org.testng.annotations.Test;

public class LogErrorsTest extends NlmCdeBaseTest {

    @Test
    public void logErrorsTest () {
        mustBeLoggedInAs(nlm_username, nlm_password);
        driver.get(baseUrl + "/server/log/triggerServerErrorExpress");
        textPresent("received");

        driver.get(baseUrl);
        clickElement(By.id("username_link"));
        clickElement(By.id("user_audit"));

        // put tab within display
        clickElement(By.cssSelector(".mat-tab-header-pagination-after"));
        clickElement(By.cssSelector(".mat-tab-header-pagination-after"));

        clickElement(By.xpath("//div[. = 'Server Errors']"));

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
