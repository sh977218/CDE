package gov.nih.nlm.cde.test.admin;

import gov.nih.nlm.system.NlmCdeBaseTest;
import org.openqa.selenium.By;
import org.testng.annotations.Test;

public class AddSiteAdmin extends NlmCdeBaseTest {

    @Test
    public void addSiteAdmin() {
        mustBeLoggedInAs(nlm_username, nlm_password);
        goToSiteAdmins();
        clickElement(By.id("saveMessage"));
        checkAlert("There was an issue adding this administrator");

        findElement(By.cssSelector("input")).sendKeys("blah blah");
        clickElement(By.id("saveMessage"));
        checkAlert("There was an issue adding this administrator");

        findElement(By.cssSelector("input")).clear();
        findElement(By.cssSelector("input")).sendKeys("siteAdminUser");
        clickElement(By.id("saveMessage"));
        checkAlert("Saved");

    }

}
