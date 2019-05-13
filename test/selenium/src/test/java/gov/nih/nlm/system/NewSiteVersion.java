package gov.nih.nlm.system;

import io.restassured.response.Response;
import org.openqa.selenium.By;
import org.openqa.selenium.support.ui.ExpectedConditions;
import org.testng.annotations.Test;

import static io.restassured.RestAssured.given;
//import static io.restassured.RestAssured.post;


public class NewSiteVersion extends NlmCdeBaseTest {

    @Test
    public void newSiteVersion() {
        mustBeLoggedInAs(test_username, password);
        goToSearch("cde");
        goHome();
        ExpectedConditions.not(ExpectedConditions.visibilityOfElementLocated
                (By.cssSelector("[data-id = 'notifications']")));

        given().body("{}").post(baseUrl + "/site-version");

        clickElement(By.id("menu_forms_link"));

        clickElement(By.cssSelector("[data-id = 'notifications']"));
        textPresent("A new version of this site is available");
    }

}
