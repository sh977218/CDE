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
        String response = get(baseUrl + "/server/log/triggerServerErrorExpress").asString();
        Assert.assertEquals("received", response);
        response = get(baseUrl + "/server/log/triggerServerErrorMongoose").asString();
        Assert.assertEquals("received", response);
        response = get(baseUrl + "/server/log/triggerClientError").asString();
        Assert.assertEquals("received", response);

        mustBeLoggedInAs(nlm_username, nlm_password);
        clickElement(By.id("username_link"));
        clickElement(By.linkText("Audit"));

        clickElement(By.linkText("Server Errors"));

        textPresent("ReferenceError: trigger is not defined");
        textPresent("/triggerServerErrorExpress");
        textPresent("app.express.error");

        clickElement(By.id("notifications"));
        textPresent("trigger server error test", By.id("notificationsDropdown"));
        textPresent("trigger server error test", By.id("notificationsDropdown"));
        textPresent("trigger client error test", By.id("notificationsDropdown"));
    }
}
