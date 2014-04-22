package gov.nih.nlm.cde.test;

import org.openqa.selenium.By;
import org.openqa.selenium.support.ui.Select;
import org.testng.Assert;

import org.testng.annotations.Test;

public class SiteAdminTest extends NlmCdeBaseTest {
    
    private void addOrg(String orgName) {
        findElement(By.id("username_link")).click();
        findElement(By.linkText("Site Management")).click();
        findElement(By.linkText("Organizations")).click();
        findElement(By.name("newOrg.name")).sendKeys(orgName);
        findElement(By.id("addOrg")).click();
        Assert.assertTrue(textPresent("Org Added"));
    }

//    private void removeOrg(String orgName) {
//        findElement(By.linkText("Account")).click();
//        findElement(By.linkText("Site Management")).click();
//        findElement(By.linkText("Organizations")).click();
//        
//        int length = driver.findElements(By.xpath("//i[contains(@id,'removeOrg-')]")).size();
//        for (int i = 0; i < length; i++) {
//            String name = findElement(By.id("orgName-" + i)).getText();
//            if (orgName.equals(name)) {
//                findElement(By.id("removeOrg-" + i)).click();     
//                i = length;
//            }
//        }
//        
//        Assert.assertTrue(textPresent("Org Removed"));
//        Assert.assertTrue(driver.findElement(By.cssSelector("BODY")).getText().indexOf(orgName) < 0);
//    }
    
    @Test
    public void addRemoveOrg() {
        mustBeLoggedInAs(nlm_username, nlm_password);
        String testOrg = "New Test Org";

        addOrg(testOrg);
    }

    @Test
    public void promoteOrgAdmin() {
        mustBeLoggedInAs(nlm_username, nlm_password);
        String testOrg = "Promote Org Test";
        
        addOrg(testOrg);
        
        findElement(By.id("username_link")).click();
        findElement(By.linkText("Site Management")).click();
        findElement(By.linkText("Organizations Admins")).click();
        new Select(driver.findElement(By.name("admin.orgName"))).selectByVisibleText(testOrg);
        findElement(By.name("orgAdmin.username")).sendKeys(test_username);
        findElement(By.id("addOrgAdmin")).click();

        logout();
        loginAs(test_username, test_password);

        findElement(By.linkText("Create")).click();
        findElement(By.linkText("CDE")).click();
        // following will assert that test user was indeed promoted
        new Select(driver.findElement(By.name("cde.stewardOrg.name"))).selectByVisibleText(testOrg);
        logout();
        mustBeLoggedInAs(nlm_username, nlm_password);
    }    
}
