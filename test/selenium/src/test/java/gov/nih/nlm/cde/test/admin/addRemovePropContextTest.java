package gov.nih.nlm.cde.test.admin;

import gov.nih.nlm.system.NlmCdeBaseTest;
import org.openqa.selenium.By;
import org.openqa.selenium.Keys;
import org.openqa.selenium.support.ui.Select;
import org.testng.annotations.Test;


public class addRemovePropContextTest extends NlmCdeBaseTest{

    @Test
    public void addRemoveProp() {
        mustBeLoggedInAs(nlm_username, nlm_password);
        clickElement(By.id("username_link"));
        clickElement(By.linkText("Org Management"));
        clickElement(By.linkText("List Management"));
        clickElement(By.id("edit_org_props_38"));
        findElement(By.id("text_entry_box_38")).sendKeys("doYouSeeThis");
        findElement(By.id("text_entry_box_38")).sendKeys(Keys.RETURN);
        clickElement(By.id("confirmEdit_38"));
        goToCdeByName("WG Test CDE");
        driver.navigate().refresh(); //it takes a while for the new element to pop up. Might even include this in a loop, up to X times
        clickElement(By.id("newPropertyKey"));
        textPresent("doYouSeeThis");


    }
    @Test
    public void doNotForgetToFinishThisTest(){
        clickElement(By.id("AUTOMATIC FAILURE"));

    }
/*
    @Test
    public void promoteOrgAdmin() {
        mustBeLoggedInAs("theOrgAuth", password);
        String testOrg = "Promote Org Test";

        addOrg(testOrg, null, null);

        clickElement(By.id("username_link"));
        clickElement(By.linkText("Org Management"));
        clickElement(By.linkText("Org Admins"));
        new Select(driver.findElement(By.id("newOrgAdminOrgName"))).selectByVisibleText(testOrg);
        findElement(By.id("newOrgAdminUsername")).sendKeys(test_username);
        clickElement(By.id("newOrgAdminSubmit"));

        logout();
        loginAs(test_username, password);

        clickElement(By.linkText("Create"));
        clickElement(By.linkText("CDE"));
        // following will assert that test user was indeed promoted
        new Select(driver.findElement(By.id("elt.stewardOrg.name"))).selectByVisibleText(testOrg);
        mustBeLoggedInAs(nlm_username, nlm_password);

        clickElement(By.id("username_link"));
        clickElement(By.linkText("Org Management"));
        clickElement(By.linkText("Org Admins"));

        clickElement(By.xpath("//span[contains(text(),'" + test_username + "')]/..//i[@title=\"Remove\"]"));
        textNotPresent(test_username);

    }

    @Test
    public void siteAdminCanOrgAdmin() {
        mustBeLoggedInAs(nlm_username, nlm_password);
        clickElement(By.id("username_link"));
        clickElement(By.linkText("Org Management"));
        textPresent("Albert Einstein Cancer Center");
    }*/

}
