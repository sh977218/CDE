package gov.nih.nlm.cde.test;

import gov.nih.nlm.system.NlmCdeBaseTest;
import org.openqa.selenium.By;
import org.openqa.selenium.support.ui.ExpectedConditions;
import org.testng.annotations.Test;

public class OrgAdminCantEditHisCdes extends NlmCdeBaseTest {
    @Test
    public void orgAdminCanEditHisCdes() {
        mustBeLoggedInAs(cabigEditor_username, password);
        goToCdeByName("Cervical Tumor Clinical T Stage");
        textPresent("as defined by the AJCC Cancer Staging Manual, 6th Ed.");
        shortWait.until(ExpectedConditions.invisibilityOfElementLocated(By.xpath("//mat-icon[normalize-space() = 'edit']")));
        goToCdeByName("Communication Contact Email Address java.lang.String");
        textPresent("A modern Internet e-mail address (using SMTP)");
        shortWait.until(ExpectedConditions.visibilityOfElementLocated(By.xpath("//mat-icon[normalize-space() = 'edit']")));
    }
}
