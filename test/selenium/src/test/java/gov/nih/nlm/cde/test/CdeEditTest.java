package gov.nih.nlm.cde.test;


import org.openqa.selenium.By;
import org.openqa.selenium.Keys;
import org.openqa.selenium.support.ui.Select;
import org.testng.Assert;
import org.testng.annotations.Test;

/**
 *
 * @author ludetc
 */
public class CdeEditTest extends NlmCdeBaseTest {    
        
    @Test
    public void comments() {
        loginAs(test_username, test_password);
        goToCdeByName("Hospital Confidential Institution Referred From");
        findElement(By.linkText("Discussions")).click();
        findElement(By.name("comment")).sendKeys("My First Comment!");
        findElement(By.name("postComment")).click();
        Assert.assertTrue(textPresent("Comment added"));
        Assert.assertTrue(textPresent("testuser"));
        Assert.assertTrue(textPresent("My First Comment!"));
        findElement(By.name("comment")).sendKeys("another comment");
        findElement(By.name("postComment")).click();
        Assert.assertTrue(textPresent("Comment added"));
        findElement(By.xpath("//div[3]/div[2]/div[2]/i")).click();
        Assert.assertTrue(textPresent("Comment removed"));
        Assert.assertTrue(driver.findElement(By.cssSelector("BODY")).getText().indexOf("another comment") < 0);
        logout();        
    }
 
    @Test(priority=0)
    public void addOrg() {
        loginAs(nlm_username, nlm_password);
        findElement(By.linkText("Account")).click();
        findElement(By.linkText("Site Management")).click();
        findElement(By.linkText("Organizations")).click();
        findElement(By.name("newOrg.name")).sendKeys(test_reg_auth);
        findElement(By.id("addOrg")).click();
        logout();
    }
    
    @Test(dependsOnMethods = {"addOrg"})
    public void promoteOrgAdmin() {
        loginAs(nlm_username, nlm_password);
        findElement(By.linkText("Account")).click();
        findElement(By.linkText("Site Management")).click();
        findElement(By.linkText("Organizations Admins")).click();
        new Select(driver.findElement(By.name("admin.orgName"))).selectByVisibleText(test_reg_auth);
        findElement(By.name("orgAdmin.username")).sendKeys(test_username);
        findElement(By.id("addOrgAdmin")).click();
        logout();
        loginAs(test_username, test_password);
        findElement(By.linkText("Create")).click();
        findElement(By.linkText("CDE")).click();
        // following will assert that test user was indeed promoted
        new Select(driver.findElement(By.name("cde.stewardOrg.name"))).selectByVisibleText(test_reg_auth);                
        logout();
    }
    
    @Test(dependsOnMethods = {"promoteOrgAdmin"}) 
    public void createCde() {
        loginAs(test_username, test_password);
        findElement(By.linkText("Create")).click();
        findElement(By.linkText("CDE")).click();
        findElement(By.name("cde.designation")).sendKeys("name of testuser CDE 1");
        findElement(By.name("cde.definition")).sendKeys("Definition for testUser CDE 1");
        findElement(By.name("cde.version")).sendKeys("1.0alpha1");
        new Select(findElement(By.name("cde.stewardOrg.name"))).selectByVisibleText(test_reg_auth);
        findElement(By.id("cde.submit")).click();
        driver.get(baseUrl + "/");
        findElement(By.name("ftsearch")).sendKeys("testUser CDE 1");
        findElement(By.id("search.submit")).click();
        findElement(By.linkText(test_reg_auth + " -- name of testuser CDE 1")).click();
        findElement(By.linkText("View Full Detail")).click();
        Assert.assertTrue(textPresent("Definition for testUser CDE 1"));
        logout();
    }
    
    @Test
    public void createCdeSuggest() {
        loginAs(ctepCurator_username, ctepCurator_password);
        findElement(By.linkText("Create")).click();
        findElement(By.linkText("CDE")).click();
        // wait for page to load
        findElement(By.id("cde.submit"));
        Assert.assertTrue(driver.findElement(By.cssSelector("BODY")).getText().indexOf("Possible Matches") < 0);
        findElement(By.name("cde.designation")).sendKeys("Patient Name");
        Assert.assertTrue(textPresent("Possible Matches"));
        Assert.assertTrue(textPresent("CTEP -- Patient Name"));
        logout();
    }

    @Test(dependsOnMethods = {"createCde"})
    public void editCde() {
        loginAs(test_username, test_password);
        goToCdeByName("name of testuser CDE 1");
        findElement(By.cssSelector("i.icon-pencil")).click();
        findElement(By.xpath("//inline-edit/span/span[2]/input")).sendKeys("[name change number 1]");
        findElement(By.cssSelector("i.icon-check")).click();
        findElement(By.cssSelector("inline-area-edit.ng-isolate-scope.ng-scope > div > div.ng-binding > i.icon-pencil")).click();
        findElement(By.xpath("//inline-area-edit/div/div[2]/textarea")).sendKeys("[def change number 1]");
        findElement(By.xpath("//inline-area-edit/div/div[2]/i")).click();
        findElement(By.xpath("//inline-edit[@id = 'uomEdit']//i[@class = 'icon-pencil']")).click();
        findElement(By.xpath("//inline-edit[@id = 'uomEdit']//input")).sendKeys("myUom");
        findElement(By.xpath("//inline-edit[@id = 'uomEdit']//i[@class = 'icon-check']")).click();
        findElement(By.cssSelector("button.btn.btn-primary")).click();
        findElement(By.name("changeNote")).sendKeys("Change note for change number 1");
        Assert.assertTrue(textPresent("This version number has already been used"));
        findElement(By.name("version")).sendKeys(Keys.BACK_SPACE);
        findElement(By.name("version")).sendKeys("2");
        findElement(By.cssSelector("button.btn.btn-warning")).click();
        findElement(By.linkText("CDEs")).click();
        findElement(By.name("ftsearch")).sendKeys("testUser CDE 1");
        findElement(By.id("search.submit")).click();
        findElement(By.linkText(test_reg_auth + " -- name of testuser CDE 1[name change number 1]")).click();
        findElement(By.linkText("View Full Detail")).click();
        Assert.assertTrue(textPresent("[name change number 1]"));
        Assert.assertTrue(textPresent("[def change number 1]"));
        Assert.assertTrue(textPresent("1.0alpha2"));
        Assert.assertTrue(textPresent("myUom"));
        // test that label and its value are aligned. 
        Assert.assertEquals(findElement(By.id("dt_createdBy")).getLocation().y, findElement(By.id("dd_createdBy")).getLocation().y);
        logout();
    }
        
    @Test(dependsOnMethods = {"editCde"})
    public void editHistory() {
        goToCdeByName("name of testuser CDE 1");
        findElement(By.linkText("History")).click();
        Assert.assertTrue(textPresent("testuser"));
        Assert.assertTrue(textPresent("Change note for change number 1"));
        findElement(By.xpath("//tr[2]//td[4]/i")).click();
        Assert.assertTrue(textPresent("name of testuser CDE 1[name change number 1]"));
        Assert.assertTrue(textPresent("Definition for testUser CDE 1[def change number 1]"));
    }

    
}
