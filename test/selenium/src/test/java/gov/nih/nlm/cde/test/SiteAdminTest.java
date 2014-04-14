/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

package gov.nih.nlm.cde.test;

import static gov.nih.nlm.cde.test.NlmCdeBaseTest.nlm_username;
import org.openqa.selenium.By;
import org.openqa.selenium.support.ui.Select;
import org.testng.Assert;
import org.testng.annotations.AfterClass;
import org.testng.annotations.BeforeClass;
import org.testng.annotations.Test;

/**
 *
 * @author ludetc
 */
public class SiteAdminTest extends NlmCdeBaseTest {
    
    @BeforeClass
    public void login() {
        loginAs(nlm_username, nlm_password);
    }

    @AfterClass
    public void logMeOut() {
        logout();
    }  
    
    private void addOrg(String orgName) {
        findElement(By.linkText("Account")).click();
        findElement(By.linkText("Site Management")).click();
        findElement(By.linkText("Organizations")).click();
        findElement(By.name("newOrg.name")).sendKeys(orgName);
        findElement(By.id("addOrg")).click();
        Assert.assertTrue(textPresent("Org Added"));
    }

    private void removeOrg(String orgName) {
        findElement(By.linkText("Account")).click();
        findElement(By.linkText("Site Management")).click();
        findElement(By.linkText("Organizations")).click();
        
        int length = driver.findElements(By.xpath("//i[contains(@id,'removeOrg-')]")).size();
//        int length = driver.findElements(By.cssSelector("i.fa-trash-o")).size();
        for (int i = 0; i < length; i++) {
            String name = findElement(By.id("orgName-" + i)).getText();
            if (orgName.equals(name)) {
                findElement(By.id("removeOrg-" + i)).click();     
                i = length;
            }
        }
        
        Assert.assertTrue(textPresent("Org Removed"));
        Assert.assertTrue(driver.findElement(By.cssSelector("BODY")).getText().indexOf(orgName) < 0);
    }
    
    @Test
    public void addRemoveOrg() {
        String testOrg = "New Test Org";

        addOrg(testOrg);
//        removeOrg(testOrg);    
    }

    @Test
    public void promoteOrgAdmin() {
        String testOrg = "Promote Org Test";
        
        addOrg(testOrg);
        
        findElement(By.linkText("Account")).click();
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
//        login();
//        removeOrg(testOrg);
    }

    
}
