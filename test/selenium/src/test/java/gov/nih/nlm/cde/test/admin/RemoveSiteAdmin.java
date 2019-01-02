package gov.nih.nlm.cde.test.admin;

import gov.nih.nlm.system.NlmCdeBaseTest;
import org.openqa.selenium.By;
import org.testng.annotations.Test;

public class RemoveSiteAdmin extends NlmCdeBaseTest {

    @Test
    public void removeSiteAdmin () {
        mustBeLoggedInAs(nlm_username, nlm_password);
        clickElement(By.id("username_link"));
        clickElement(By.linkText("Site Management"));
        clickElement(By.xpath("//div[. = 'Site Admins']"));

        clickElement(By.xpath("//td[span[. = 'promoteSiteAdmin']]/mat-icon"));

        checkAlert("Removed");
        textNotPresent("promoteSiteAdmin");
    }

}
