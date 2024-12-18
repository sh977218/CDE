package gov.nih.nlm.cde.test.regstatus;

import gov.nih.nlm.system.NlmCdeBaseTest;
import org.openqa.selenium.By;
import org.openqa.selenium.support.ui.Select;
import org.testng.annotations.Test;

public class CdeCancelRegStatusTest extends NlmCdeBaseTest {
    @Test
    public void cdeCancelRegistrationStatus() {
        String cdeName = "Form Form Element Administered Item Modified By java.lang.String";
        mustBeLoggedInAs(cabigEditor_username, password);
        goToCdeByName(cdeName);
        textPresent("Qualified");
        startEditRegistrationStatus();
        new Select(driver.findElement(By.name("newRegistrationStatus"))).selectByVisibleText("Recorded");
        clickCancelButton();
        modalGone();
        goToCdeByName(cdeName);
        textPresent("Qualified", By.cssSelector("[itemprop='registrationStatus']"));
    }
}
