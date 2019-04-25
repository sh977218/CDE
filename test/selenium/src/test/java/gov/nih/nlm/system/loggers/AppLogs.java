package gov.nih.nlm.system.loggers;

import gov.nih.nlm.system.NlmCdeBaseTest;
import org.openqa.selenium.By;
import org.testng.annotations.Test;

public class AppLogs extends NlmCdeBaseTest {

    @Test
    public void appLogs() {
        mustBeLoggedInAs(nlm_username, nlm_password);
        openUserMenu();
        clickElement(By.linkText("Audit"));
        clickElement(By.xpath("//div[. = 'App Logs']"));
        findElement(By.id("fromDate")).sendKeys("01012000101P");
        findElement(By.id("toDate")).sendKeys("01012030101P");
        clickElement(By.id("searchBtn"));
        textPresent("done with sitemap");
    }
}
