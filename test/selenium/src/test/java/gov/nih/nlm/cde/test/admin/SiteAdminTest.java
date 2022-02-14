package gov.nih.nlm.cde.test.admin;

import gov.nih.nlm.system.NlmCdeBaseTest;
import org.openqa.selenium.By;
import org.openqa.selenium.support.ui.Select;
import org.testng.annotations.Test;

public class SiteAdminTest extends NlmCdeBaseTest {

    @Test
    public void addOrg() {
        mustBeLoggedInAs(theOrgAuth_username, password);
        String testOrg = "New Test Org";
        addOrg(testOrg, null, null);

        String testOrgName = "New Test Org 2";
        String testOrgLongName = "New Test Org 2 Long Name 2";
        addOrg(testOrgName, testOrgLongName, null);
    }

    @Test
    public void promoteOrgAdmin() {
        mustBeLoggedInAs(theOrgAuth_username, password);
        String testOrg = "Promote Org Test";

        addOrg(testOrg, null, null);

        goToAdmins();
        new Select(driver.findElement(By.name("newOrgAdminOrgName"))).selectByVisibleText(testOrg);
        searchUsername(test_username);
        clickElement(By.xpath("//button[contains(.,'Make Admin')]"));
        logout();

        loginAs(test_username, password);
        goToAdmins();
        new Select(driver.findElement(By.name("newOrgAdminOrgName"))).selectByVisibleText(testOrg);
        goToEditors();
        new Select(driver.findElement(By.name("newOrgEditorOrgName"))).selectByVisibleText(testOrg);
        searchUsername(testEditor_username);
        clickElement(By.xpath("//button[contains(.,'Make Editor')]"));
        logout();

        loginAs(testEditor_username, password);
        hoverOverElement(findElement(By.id("createEltLink")));
        clickElement(By.id("createCDELink"));
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
