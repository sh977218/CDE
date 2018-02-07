package gov.nih.nlm.system;

import org.openqa.selenium.By;
import org.testng.annotations.Test;

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

        loginAs(nlm_username, nlm_password);
        clickElement(By.id("username_link"));
        clickElement(By.linkText("Audit"));
        clickElement(By.linkText("Reported Issues"));
        textPresent("I don't like this website.");
    }
}
