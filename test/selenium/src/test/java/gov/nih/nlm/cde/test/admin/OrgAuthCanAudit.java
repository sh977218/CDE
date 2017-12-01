package gov.nih.nlm.cde.test.admin;

import gov.nih.nlm.system.NlmCdeBaseTest;
import org.openqa.selenium.By;
import org.testng.annotations.Test;

public class OrgAuthCanAudit extends NlmCdeBaseTest {

    @Test
    public void orgAuthCanAudit() {
        mustBeLoggedInAs("theOrgAuth", password);
        clickElement(By.id("username_link"));
        clickElement(By.id("user_audit"));

        clickElement(By.partialLinkText("CDE Audit Log"));
        clickElement(By.cssSelector("div.card a"));
        textPresent("Type of Modification");

        clickElement(By.partialLinkText("Classification Audit Log"));
        clickElement(By.cssSelector("div.card a"));
        findElement(By.xpath("//dt[. = 'User']"));

        clickElement(By.partialLinkText("Reported Issues"));
        textPresent("sdgfdsgdsaf");
    }

}
