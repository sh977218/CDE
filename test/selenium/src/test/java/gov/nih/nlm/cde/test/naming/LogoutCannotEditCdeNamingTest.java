package gov.nih.nlm.cde.test.naming;

import gov.nih.nlm.system.NlmCdeBaseTest;
import org.openqa.selenium.By;
import org.openqa.selenium.support.ui.ExpectedConditions;
import org.testng.annotations.Test;

public class LogoutCannotEditCdeNamingTest extends NlmCdeBaseTest {

    @Test
    public void logoutCannotEditCdeNaming() {
        String cdeName = "cde for test cde reorder detail tabs";
        goToCdeByName(cdeName);
        goToNaming();
        shortWait.until(ExpectedConditions.invisibilityOfElementLocated(By.xpath("//mat-icon[contains(., 'delete')]")));
    }

}
