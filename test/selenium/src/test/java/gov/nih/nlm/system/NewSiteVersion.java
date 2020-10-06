package gov.nih.nlm.system;

import org.openqa.selenium.By;
import org.openqa.selenium.support.ui.ExpectedConditions;
import org.testng.annotations.Test;

import static io.restassured.RestAssured.given;

public class NewSiteVersion extends NlmCdeBaseTest {

    @Test
    public void newSiteVersion() {
        mustBeLoggedInAs(test_username, password);
        goToSearch("cde");
        goHome();
        ExpectedConditions.not(ExpectedConditions.visibilityOfElementLocated(By.id("notificationLink")));

        given().body("{}").post(baseUrl + "/server/user/site-version");

        clickElement(By.id("menu_forms_link"));

        findElement(By.cssSelector("span.mat-badge-active"));

        clickElement(By.id("notificationLink"));
        textPresent("A new version of this site is available");
    }

}
