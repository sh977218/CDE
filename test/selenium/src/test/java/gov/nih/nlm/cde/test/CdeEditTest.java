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

    @Test(priority = 0)
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
        goToCdeByName("name of testuser CDE 1");
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
        findElement(By.cssSelector("i.fa-edit")).click();
        findElement(By.xpath("//inline-edit/span/span[2]/input")).sendKeys("[name change number 1]");
        findElement(By.cssSelector("i.fa-check-square-o")).click();
        findElement(By.xpath("//dd[@id = 'dd_def']//i[@class='fa fa-edit']")).click();
        findElement(By.xpath("//inline-area-edit/div/div[2]/textarea")).sendKeys("[def change number 1]");
        findElement(By.xpath("//inline-area-edit/div/div[2]/i")).click();
        findElement(By.xpath("//inline-edit[@id = 'uomEdit']//i[@class = 'fa fa-edit']")).click();
        findElement(By.xpath("//inline-edit[@id = 'uomEdit']//input")).sendKeys("myUom");
        findElement(By.xpath("//inline-edit[@id = 'uomEdit']//i[@class = 'fa fa-check-square-o']")).click();
        findElement(By.cssSelector("button.btn.btn-primary")).click();
        findElement(By.name("changeNote")).sendKeys("Change note for change number 1");
        Assert.assertTrue(textPresent("This version number has already been used"));
        findElement(By.name("version")).sendKeys(Keys.BACK_SPACE);
        findElement(By.name("version")).sendKeys("2");
        findElement(By.cssSelector("button.btn.btn-warning")).click();
        goToCdeByName("name of testuser CDE 1");
        Assert.assertTrue(textPresent("[name change number 1]"));
        Assert.assertTrue(textPresent("[def change number 1]"));
        Assert.assertTrue(textPresent("1.0alpha2"));
        Assert.assertTrue(textPresent("myUom"));
        // test that label and its value are aligned. 
        Assert.assertEquals(findElement(By.id("dt_createdBy")).getLocation().y, findElement(By.id("dd_createdBy")).getLocation().y);
        logout();
    }

    @Test(dependsOnMethods = {"editCde"})
    public void viewHistory() {
        goToCdeByName("name of testuser CDE 1");
        findElement(By.linkText("History")).click();
        Assert.assertTrue(textPresent("testuser"));
        Assert.assertTrue(textPresent("Change note for change number 1"));
        findElement(By.xpath("//tr[2]//td[4]/i")).click();
        Assert.assertTrue(textPresent("name of testuser CDE 1[name change number 1]"));
        Assert.assertTrue(textPresent("Definition for testUser CDE 1[def change number 1]"));
    }

    @Test(dependsOnMethods = {"editCde"})
    public void viewPriorVersion() {
        goToCdeByName("name of testuser CDE 1");
        findElement(By.linkText("History")).click();
        findElement(By.id("prior-0")).click();
        Assert.assertTrue(textPresent("1.0alpha1"));
        Assert.assertTrue(textPresent("Warning: this data element is archived."));
    }

    @Test
    public void editConcepts() {
        loginAs(ctepCurator_username, ctepCurator_password);
        
        goToCdeByName("Patient Photograph");
        findElement(By.linkText("Concepts")).click();
        findElement(By.id("addConcept")).click();
        modalHere();
        findElement(By.name("name")).sendKeys("DEC1");
        findElement(By.name("codeId")).sendKeys("DEC_CODE_111");
        findElement(By.id("createConcept")).click();
        
        findElement(By.id("addConcept")).click();
        modalHere();
        findElement(By.name("name")).sendKeys("OC1");
        findElement(By.name("codeId")).sendKeys("OC_CODE_111");
        new Select(driver.findElement(By.name("conceptType"))).selectByVisibleText("Class");
        findElement(By.id("createConcept")).click();

        findElement(By.id("addConcept")).click();
        modalHere();
        findElement(By.name("name")).sendKeys("Prop1");
        findElement(By.name("codeId")).sendKeys("Prop_CODE_111");
        new Select(driver.findElement(By.name("conceptType"))).selectByVisibleText("Property");
        findElement(By.id("createConcept")).click();

        findElement(By.id("openSave")).click();
        findElement(By.name("version")).sendKeys(".1");
        findElement(By.id("confirmSave")).click();

        goToCdeByName("Patient Photograph");
        findElement(By.linkText("Concepts")).click();
        Assert.assertTrue(textPresent("DEC_CODE_111"));
        Assert.assertTrue(textPresent("OC_CODE_111"));
        Assert.assertTrue(textPresent("Prop_CODE_111"));
        
        findElement(By.id("decConceptRemove-0")).click();
        findElement(By.id("ocConceptRemove-1")).click();
        findElement(By.id("propConceptRemove-3")).click();
        
        findElement(By.id("openSave")).click();
        findElement(By.name("version")).sendKeys(".2");
        findElement(By.id("confirmSave")).click();
        
        goToCdeByName("Patient Photograph");
        Assert.assertTrue(driver.findElement(By.cssSelector("BODY")).getText().indexOf("DEC1") < 0);
        Assert.assertTrue(driver.findElement(By.cssSelector("BODY")).getText().indexOf("OC1") < 0);
        Assert.assertTrue(driver.findElement(By.cssSelector("BODY")).getText().indexOf("PROP1") < 0);
        
        logout();
    }

}
