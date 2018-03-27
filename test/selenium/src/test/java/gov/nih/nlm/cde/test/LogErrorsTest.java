package gov.nih.nlm.cde.test;

import gov.nih.nlm.system.NlmCdeBaseTest;
import gov.nih.nlm.system.SelectBrowser;
import org.openqa.selenium.By;
import org.testng.Assert;
import org.testng.annotations.Test;

import static com.jayway.restassured.RestAssured.get;

public class LogErrorsTest extends NlmCdeBaseTest {
    @Test
    public void logServerErrors() {
        String response = get(baseUrl + "/triggerServerErrorExpress").asString();
        Assert.assertEquals("received", response);
        response = get(baseUrl + "/triggerServerErrorMongoose").asString();
        Assert.assertEquals("received", response);

        mustBeLoggedInAs(nlm_username, nlm_password);
        findElement(By.id("username_link")).click();
        findElement(By.linkText("Audit")).click();

        findElement(By.linkText("Server Errors")).click();

        textPresent("ReferenceError: trigger is not defined");
        textPresent("/triggerServerErrorExpress");
        textPresent("app.express.error");
    }

    @Test
    @SelectBrowser()
    public void createIEError () {
        driver.get(baseUrl + "/sdcview?triggerClientError=1&fullPath=true&inIE=true");
        textPresent("SDC Attributes");
    }


    @Test(dependsOnMethods = {"createIEError"})
    public void logClientErrors() {
        driver.get(baseUrl + "/sdcview?triggerClientError=1&fullPath=true");
        textPresent("SDC Attributes");

        mustBeLoggedInAs(nlm_username, nlm_password);
        clickElement(By.id("username_link"));
        clickElement(By.linkText("Audit"));

        clickElement(By.linkText("Client Errors"));
        textPresent("An exception has been thown");

        textNotPresent("IE 11");
        textNotPresent("inIE=true");
        clickElement(By.id("ie"));
        textPresent("IE 11");
        textPresent("inIE=true");
    }
}
