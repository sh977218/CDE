package gov.nih.nlm.cde.test;

import gov.nih.nlm.system.NlmCdeBaseTest;
import org.openqa.selenium.By;
import org.openqa.selenium.support.ui.ExpectedConditions;
import org.testng.annotations.Test;

public class CanEditInCompareTest extends NlmCdeBaseTest {
    @Test
    public void cantEditInCompare() {
        mustBeLoggedInAs(ctepEditor_username, password);
        addCdeToCompare("Person Birth Date", "Patient Ethnic Group Category");
        shortWait.until(ExpectedConditions.invisibilityOfElementLocated(By.xpath(xpathRegistrationStatusEditable())));
        shortWait.until(ExpectedConditions.invisibilityOfElementLocated(By.xpath("//button[contains(.,'Add Name')]")));
        shortWait.until(ExpectedConditions.invisibilityOfElementLocated(By.xpath("//mat-dialog-container//mat-icon[contains(., 'delete')]")));
        shortWait.until(ExpectedConditions.invisibilityOfElementLocated(By.xpath("//mat-dialog-container//mat-icon[. = 'edit']")));
    }
}
