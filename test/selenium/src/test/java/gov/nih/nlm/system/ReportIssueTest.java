package gov.nih.nlm.system;

import org.openqa.selenium.By;
import org.testng.annotations.Test;

import static io.restassured.RestAssured.post;
import static io.restassured.RestAssured.when;

public class ReportIssueTest extends NlmCdeBaseTest {

    @Test
    public void report() {
        goToCdeSearch();
        clickElement(By.cssSelector(".feedback-btn"));
        hangon(1);
        findElement(By.id("feedback-note-tmp")).sendKeys("I don't like this website.");
        clickElement(By.id("feedback-welcome-next"));
        clickElement(By.id("feedback-highlighter-next"));
        clickElement(By.id("feedback-submit"));
        textPresent("issue was successfully submitted");
        clickElement(By.cssSelector(".feedback-close-btn"));
        hangon(1);

        loginAs("theOrgauth", password);
        clickElement(By.id("username_link"));
        clickElement(By.linkText("Audit"));
        clickElement(By.xpath("//div[. = 'Reported Issues']"));
        textPresent("I don't like this website.");
    }

    // this will get yourself blocked from submitting feedback so depend on the good test first
//    @Test(dependsOnMethods = {"report"})
    @Test
    public void get509 () {

        post(baseUrl + "/feedback/report").asString();

        // second time 509
        when().post(baseUrl + "/feedback/report").then().statusCode(509);

    }

}
