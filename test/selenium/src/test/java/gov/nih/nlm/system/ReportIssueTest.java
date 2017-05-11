package gov.nih.nlm.system;

import org.openqa.selenium.By;
import org.testng.annotations.Test;

public class ReportIssueTest extends NlmCdeBaseTest {

    @Test
    public void report() {
        goToCdeSearch();
        findElement(By.cssSelector(".feedback-btn")).click();
        hangon(1);
        findElement(By.id("feedback-note-tmp")).sendKeys("I don't like this website.");
        findElement(By.id("feedback-welcome-next")).click();
        findElement(By.id("feedback-highlighter-next")).click();
        findElement(By.id("feedback-submit")).click();
        textPresent("issue was successfully submitted");
        findElement(By.cssSelector(".feedback-close-btn")).click();
        hangon(1);

        loginAs(nlm_username, nlm_password);
        findElement(By.id("username_link")).click();
        findElement(By.linkText("Audit")).click();
        findElement(By.linkText("Reported Issues")).click();
        textPresent("I don't like this website.");
    }
}
