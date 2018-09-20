package gov.nih.nlm.cde.test;

import gov.nih.nlm.system.NlmCdeBaseTest;
import gov.nih.nlm.system.SelectBrowser;
import org.openqa.selenium.By;
import org.testng.annotations.Test;

public class LogClientErrors extends NlmCdeBaseTest {

    @Test
    @SelectBrowser()
    public void createIEError() {
        driver.get(baseUrl + "/searchPreferences?triggerClientError=1&fullPath=true&inIE=true");
        textPresent("By default, I want to see results as");
    }

    @Test(dependsOnMethods = {"createIEError"})
    public void logClientErrors() {
        mustBeLoggedInAs(nlm_username, nlm_password);
        driver.get(baseUrl + "/searchPreferences?triggerClientError=1&fullPath=true");
        textPresent("Reported Issues");

        logout();
        mustBeLoggedInAs(nlm_username, nlm_password);
        clickElement(By.id("username_link"));
        clickElement(By.linkText("Audit"));

        clickElement(By.linkText("Client Errors"));
        textPresent("An exception has been thrown");

        textNotPresent("IE 11");
        textNotPresent("inIE=true");
        clickElement(By.id("ie"));
        textPresent("IE 11");
        textPresent("inIE=true");
    }

}
