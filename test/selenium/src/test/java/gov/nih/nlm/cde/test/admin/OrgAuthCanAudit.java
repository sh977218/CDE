package gov.nih.nlm.cde.test.admin;

import gov.nih.nlm.system.NlmCdeBaseTest;
import org.openqa.selenium.By;
import org.testng.annotations.Test;

public class OrgAuthCanAudit extends NlmCdeBaseTest {

    @Test
    public void orgAuthCanAudit() {
        mustBeLoggedInAs(theOrgAuth_username, password);
        goToAudit();

        clickElement(By.xpath("//div[. = 'CDE Audit Log']"));
        clickElement(By.cssSelector("mat-panel-title"));
        findElement(By.xpath("//dt[. = 'User:']"));

        clickElement(By.xpath("//div[. = 'Classification Audit Log']"));
        clickElement(By.cssSelector("mat-panel-title"));
        findElement(By.xpath("//dt[. = 'User:']"));

    }

}
