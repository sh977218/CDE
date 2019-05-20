package gov.nih.nlm.cde.test.admin;

import gov.nih.nlm.system.NlmCdeBaseTest;
import org.openqa.selenium.By;
import org.openqa.selenium.support.ui.Select;
import org.testng.annotations.Test;

public class SiteAdminTest extends NlmCdeBaseTest {

    @Test
    public void addOrg() {
        mustBeLoggedInAs("theOrgAuth", password);
        String testOrg = "New Test Org";
        addOrg(testOrg, null, null);

        String testOrgName = "New Test Org 2";
        String testOrgLongName = "New Test Org 2 Long Name 2";
        addOrg(testOrgName, testOrgLongName, null);
    }

    @Test
    public void promoteOrgAdmin() {
        mustBeLoggedInAs("theOrgAuth", password);
        String testOrg = "Promote Org Test";

        addOrg(testOrg, null, null);

        goToAdmins();
        new Select(driver.findElement(By.id("newOrgAdminOrgName"))).selectByVisibleText(testOrg);
        searchUsername(test_username);
        clickElement(By.id("newOrgAdminSubmit"));
        logout();

        loginAs(test_username, password);
        clickElement(By.id("createEltLink"));
        clickElement(By.linkText("CDE"));
        // following will assert that test user was indeed promoted
        new Select(driver.findElement(By.id("eltStewardOrgName"))).selectByVisibleText(testOrg);
        logout();

        mustBeLoggedInAs(nlm_username, nlm_password);
        goToAdmins();
        clickElement(By.xpath("//*[contains(text(),'" + test_username + "')]/..//mat-icon[normalize-space() = 'delete_outline']"));
        textNotPresent(test_username);
    }

    @Test
    public void siteAdminCanOrgAdmin() {
        mustBeLoggedInAs(nlm_username, nlm_password);
        goToOrganizations();
        textPresent("Albert Einstein Cancer Center");
    }

}
