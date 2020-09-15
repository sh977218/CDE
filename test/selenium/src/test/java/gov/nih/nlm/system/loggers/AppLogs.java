package gov.nih.nlm.system.loggers;

import gov.nih.nlm.system.NlmCdeBaseTest;
import org.openqa.selenium.By;
import org.openqa.selenium.Keys;
import org.testng.annotations.Test;

public class AppLogs extends NlmCdeBaseTest {

    @Test
    public void appLogs() {
        mustBeLoggedInAs(nlm_username, nlm_password);
        clickElement(By.id("username_link"));
        clickElement(By.id("user_audit"));
        clickElement(By.xpath("//div[. = 'App Logs']"));

        clickElement(By.id("searchBtn"));

        findElement(By.id("appFromDate")).sendKeys("01012000");
        findElement(By.id("appFromDate")).sendKeys(Keys.TAB);
        findElement(By.id("appFromDate")).sendKeys("0101P");

        findElement(By.id("appToDate")).sendKeys("01012030");
        findElement(By.id("appToDate")).sendKeys(Keys.TAB);
        findElement(By.id("appToDate")).sendKeys("0101P");

        clickElement(By.id("searchBtn"));
        clickElement(By.cssSelector(".mat-paginator-navigation-next"));
    }
}
