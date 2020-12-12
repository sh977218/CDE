package gov.nih.nlm.system;

import org.openqa.selenium.By;
import org.testng.annotations.Test;

import static io.restassured.RestAssured.*;

public class ReportIssueTest extends NlmCdeBaseTest {

    @Test
    public void report() {
        goToCdeSearch();
        clickElement(By.id("helpLink"));
        clickElement(By.id("reportAProblemLink"));
        findElement(By.cssSelector("textarea.description")).sendKeys("I don't like this website.");
        clickElement(By.cssSelector("button.submit-button"));

        checkAlert("Thank you for your feedback");

        loginAs("theOrgAuth", password);
        clickElement(By.id("username_link"));
        clickElement(By.id("user_audit"));
        clickElement(By.xpath("//div[. = 'Reported Issues']"));
        textPresent("I don't like this website.");
    }

    @Test(dependsOnMethods = {"report"})
    public void get509 () {

        given().body("{}").post(baseUrl + "/server/log/feedback/report").asString();

        // second time 509
        given().body("{}").post(baseUrl + "/server/log/feedback/report").then().statusCode(509);

    }

}
