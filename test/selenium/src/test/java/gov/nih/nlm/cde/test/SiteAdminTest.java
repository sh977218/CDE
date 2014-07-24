package gov.nih.nlm.cde.test;

import org.openqa.selenium.By;
import org.openqa.selenium.support.ui.Select;
import org.testng.Assert;

import org.testng.annotations.Test;

public class SiteAdminTest extends NlmCdeBaseTest {
    
    private void addOrg(String orgName, String orgLongName) {
        findElement(By.id("username_link")).click();
        findElement(By.linkText("Site Management")).click();
        findElement(By.linkText("Organizations")).click();
        findElement(By.name("newOrgName")).sendKeys(orgName);
        
        if( orgLongName!=null ) {
            findElement(By.name("newOrgLongName")).sendKeys(orgLongName);
        }
        
        findElement(By.id("addOrg")).click();
        Assert.assertTrue(textPresent("Org Added"));
        Assert.assertTrue(textPresent(orgName));
        
        if( orgLongName!=null ) {
            Assert.assertTrue(textPresent(orgLongName));
        }
    }
    
    private void refreshOrganizationsTabScreen() {
        driver.navigate().refresh();
        findElement(By.linkText("Organizations")).click();
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
    public void addOrg() {
        mustBeLoggedInAs(nlm_username, nlm_password);
        String testOrg = "New Test Org";
        addOrg(testOrg,null);
        
        String testOrgName = "New Test Org 2";
        String testOrgLongName = "New Test Org 2 Long Name 2";
        addOrg(testOrgName,testOrgLongName);
    }

    @Test
    public void RenameOrg() {
        mustBeLoggedInAs(nlm_username, nlm_password);
        String testOrg = "New Test Org 3";
        String testOrgRenamed = "New Test Org 3 Renamed";
        String testOrgNotRenamed = "New Test Org 3 Not Renamed";
        addOrg(testOrg,null);
        findElement(By.xpath("//div[@id = 'orgLongName-"+testOrg+"']//i[@class='fa fa-edit']")).click();
        findElement(By.xpath("//div[@id = 'orgLongName-"+testOrg+"']//input")).sendKeys(testOrgRenamed);
        findElement(By.xpath("//div[@id = 'orgLongName-"+testOrg+"']//button[@class='fa fa-check']")).click();
        refreshOrganizationsTabScreen();
        Assert.assertTrue(textPresent(testOrgRenamed));

        findElement(By.xpath("//div[@id = 'orgLongName-"+testOrg+"']//i[@class='fa fa-edit']")).click();
        findElement(By.xpath("//div[@id = 'orgLongName-"+testOrg+"']//input")).sendKeys(testOrgNotRenamed);
        findElement(By.xpath("//div[@id = 'orgLongName-"+testOrg+"']//button[@class='fa fa-times']")).click();
        Assert.assertTrue(textNotPresent(testOrgNotRenamed));
        refreshOrganizationsTabScreen();
        Assert.assertTrue(textNotPresent(testOrgNotRenamed));
    }
    
    @Test
    public void promoteOrgAdmin() {
        mustBeLoggedInAs(nlm_username, nlm_password);
        String testOrg = "Promote Org Test";
        
        addOrg(testOrg,null);
        
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
        new Select(driver.findElement(By.id("cde.stewardOrg.name"))).selectByVisibleText(testOrg);
        logout();
        mustBeLoggedInAs(nlm_username, nlm_password);
    } 
    
    @Test
    public void browseUsers() {
        mustBeLoggedInAs(nlm_username, nlm_password);
        findElement(By.id("username_link")).click();
        findElement(By.linkText("Audit")).click();
        findElement(By.name("search")).sendKeys("cabig");
        findElement(By.id("search.submit")).click();
        hangon(.5);
        Assert.assertEquals("cabigAdmin", findElement(By.id("dd_username_0")).getText());
        Assert.assertEquals("[\"caBIG\"]", findElement(By.id("dd_orgAdmin_0")).getText());
        Assert.assertEquals("N/A", findElement(By.id("dd_siteAdmin_0")).getText());

        findElement(By.name("search")).clear();            
        findElement(By.name("search")).sendKeys("nlm");
        findElement(By.id("search.submit")).click();
        hangon(.5);
        Assert.assertEquals("nlm", findElement(By.id("dd_username_0")).getText());
        Assert.assertEquals("[]", findElement(By.id("dd_orgAdmin_0")).getText());
        Assert.assertEquals("true", findElement(By.id("dd_siteAdmin_0")).getText());
    }
    
}
