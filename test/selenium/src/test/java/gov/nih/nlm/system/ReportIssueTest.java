package gov.nih.nlm.system;

import org.openqa.selenium.By;
import org.testng.annotations.Test;

public class ReportIssueTest extends NlmCdeBaseTest {

    private void reportIssue(){
        mustBeLoggedOut();
        goToCdeSearch();
        findElement(By.cssSelector(".feedback-btn")).click();
        hangon(1);
        findElement(By.id("feedback-note-tmp")).sendKeys("I don't like this website.");
        findElement(By.id("feedback-welcome-next")).click();
        findElement(By.id("feedback-highlighter-next")).click();
        findElement(By.id("feedback-submit")).click();
        findElement(By.cssSelector(".feedback-close-btn")).click();
    }
    private void checkIssueReported(){
        loginAs(nlm_username, nlm_password);
        findElement(By.id("username_link")).click();
        findElement(By.linkText("Audit")).click();
        findElement(By.linkText("Reported Issues")).click();
        textPresent("I don't like this website.");
    }

    @Test
    public void report() {
        reportIssue();
        checkIssueReported();
    }
}
