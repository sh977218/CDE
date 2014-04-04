package gov.nih.nlm.cde.test;

import java.util.concurrent.TimeUnit;
import org.openqa.selenium.By;
import org.openqa.selenium.Keys;
import org.openqa.selenium.support.ui.ExpectedConditions;
import org.openqa.selenium.support.ui.Select;
import org.testng.Assert;
import org.testng.annotations.AfterClass;
import org.testng.annotations.BeforeClass;
import org.testng.annotations.Test;

/**
 *
 * @author ludetc
 * 
 */
public class CdeEditTest extends NlmCdeBaseTest {

    private String newCdeName = "Abracadabra";
    
    @BeforeClass
    public void login() {
        loginAs(ctepCurator_username, ctepCurator_password);
    }

    // TODO I think I am using this annotation incorrectly
    @AfterClass
    public void logMeOut() {
        logout();
    }

    @Test
    public void createCde() {
        findElement(By.linkText("Create")).click();
        findElement(By.linkText("CDE")).click();
        findElement(By.name("cde.designation")).sendKeys(newCdeName);
        findElement(By.name("cde.definition")).sendKeys("Definition for testUser CDE 1");
        findElement(By.name("cde.version")).sendKeys("1.0alpha1");
        new Select(findElement(By.name("cde.stewardOrg.name"))).selectByVisibleText("CTEP");
        findElement(By.id("cde.submit")).click();
        goToCdeByName(newCdeName);
        Assert.assertTrue(textPresent("Definition for testUser CDE 1"));
    }

    @Test
    public void createCdeSuggest() {
        findElement(By.linkText("Create")).click();
        findElement(By.linkText("CDE")).click();
        // wait for page to load
        findElement(By.id("cde.submit"));
        Assert.assertTrue(driver.findElement(By.cssSelector("BODY")).getText().indexOf("Possible Matches") < 0);
        findElement(By.name("cde.designation")).sendKeys("Patient Name");
        Assert.assertTrue(textPresent("Possible Matches"));
        Assert.assertTrue(textPresent("Patient Name"));
    }

    @Test(dependsOnMethods = {"createCde"})
    public void editCde() {
        login();
        goToCdeByName(newCdeName);
        findElement(By.cssSelector("i.fa-edit")).click();
        findElement(By.xpath("//inline-edit/span/span[2]/input")).sendKeys("[name change number 1]");
        findElement(By.cssSelector(".fa-check")).click();
        findElement(By.xpath("//dd[@id = 'dd_def']//i[@class='fa fa-edit']")).click();
        findElement(By.xpath("//inline-area-edit/div/div[2]/textarea")).sendKeys("[def change number 1]");
        findElement(By.cssSelector("inline-area-edit .fa-check")).click();
        findElement(By.xpath("//inline-edit[@id = 'uomEdit']//i[@class = 'fa fa-edit']")).click();
        findElement(By.xpath("//inline-edit[@id = 'uomEdit']//input")).sendKeys("myUom");
        findElement(By.cssSelector("#dd_uom .fa-check")).click();
        findElement(By.cssSelector("button.btn.btn-primary")).click();
        findElement(By.name("changeNote")).sendKeys("Change note for change number 1");
        Assert.assertTrue(textPresent("This version number has already been used"));
        findElement(By.name("version")).sendKeys(Keys.BACK_SPACE);
        findElement(By.name("version")).sendKeys("2");
        findElement(By.id("confirmSave")).click();
        goToCdeByName(newCdeName);
        Assert.assertTrue(textPresent("[name change number 1]"));
        Assert.assertTrue(textPresent("[def change number 1]"));
        Assert.assertTrue(textPresent("1.0alpha2"));
        Assert.assertTrue(textPresent("myUom"));
        // test that label and its value are aligned. 
        Assert.assertEquals(findElement(By.id("dt_createdBy")).getLocation().y, findElement(By.id("dd_createdBy")).getLocation().y);
    }

    @Test(dependsOnMethods = {"editCde"})
    public void viewHistory() {
        goToCdeByName(newCdeName);
        findElement(By.linkText("History")).click();
        Assert.assertTrue(textPresent(newCdeName));
        Assert.assertTrue(textPresent("Change note for change number 1"));
        findElement(By.xpath("//tr[2]//td[4]/a")).click();
        Assert.assertTrue(textPresent(newCdeName + "[name change number 1]"));
        Assert.assertTrue(textPresent("Definition for testUser CDE 1[def change number 1]"));
    }

    @Test(dependsOnMethods = {"editCde"})
    public void viewPriorVersion() {
        goToCdeByName(newCdeName);
        findElement(By.linkText("History")).click();
        findElement(By.id("prior-0")).click();
        Assert.assertTrue(textPresent("1.0alpha1"));
        Assert.assertTrue(textPresent("Warning: this data element is archived."));
    }

    @Test
    public void editConcepts() {
        String cdeName = "Patient Photograph Malignant";
        
        goToCdeByName(cdeName);
        findElement(By.linkText("Concepts")).click();

        findElement(By.id("addConcept")).click();
        modalHere();
        findElement(By.name("name")).sendKeys("DEC1");
        findElement(By.name("codeId")).sendKeys("DEC_CODE_111");
        findElement(By.id("createConcept")).click();
        hangon(5);
        wait.until(ExpectedConditions.elementToBeClickable(By.id("addConcept")));
        findElement(By.id("addConcept")).click();
        modalHere();
        findElement(By.name("name")).sendKeys("OC1");
        findElement(By.name("codeId")).sendKeys("OC_CODE_111");
        new Select(driver.findElement(By.name("conceptType"))).selectByVisibleText("Class");
        findElement(By.id("createConcept")).click();
        hangon(2);

        findElement(By.id("addConcept")).click();
        modalHere();
        findElement(By.name("name")).sendKeys("Prop1");
        findElement(By.name("codeId")).sendKeys("Prop_CODE_111");
        new Select(driver.findElement(By.name("conceptType"))).selectByVisibleText("Property");
        findElement(By.id("createConcept")).click();
        hangon(2);

        findElement(By.id("openSave")).click();
        findElement(By.name("version")).sendKeys(".1");
        modalHere();
        findElement(By.id("confirmSave")).click();
        hangon(2);

        goToCdeByName(cdeName);
        findElement(By.linkText("Concepts")).click();
        Assert.assertTrue(textPresent("DEC_CODE_111"));
        Assert.assertTrue(textPresent("OC_CODE_111"));
        Assert.assertTrue(textPresent("Prop_CODE_111"));
        
        findElement(By.id("decConceptRemove-0")).click();
        findElement(By.id("ocConceptRemove-1")).click();
        findElement(By.id("propConceptRemove-3")).click();
        
        findElement(By.id("openSave")).click();
        modalHere();
        findElement(By.name("version")).sendKeys(".2");
        findElement(By.id("confirmSave")).click();
        hangon(2);
        
        goToCdeByName(cdeName);
        Assert.assertTrue(driver.findElement(By.cssSelector("BODY")).getText().indexOf("DEC1") < 0);
        Assert.assertTrue(driver.findElement(By.cssSelector("BODY")).getText().indexOf("OC1") < 0);
        Assert.assertTrue(driver.findElement(By.cssSelector("BODY")).getText().indexOf("PROP1") < 0);
    }
    
    @Test(dependsOnMethods = {"editCde"})
    public void changeDefinitionFormat() {
        login();
        goToCdeByName(newCdeName);
        findElement(By.cssSelector("#dd_def .fa-edit")).click();
        findElement(By.xpath("//inline-area-edit/div/div[2]/textarea")).sendKeys("[def change number 2: adding html characters][<b>bold</b>]");
        findElement(By.cssSelector("inline-area-edit .fa-check")).click();
        findElement(By.id("openSave")).click();
        findElement(By.name("version")).sendKeys(Keys.BACK_SPACE);
        findElement(By.name("version")).sendKeys("-plaintext"); 
        findElement(By.id("confirmSave")).click();
        goToCdeByName(newCdeName);   
        Assert.assertTrue(textPresent("<b>bold</b>"));
        
        findElement(By.cssSelector("#dd_def .fa-edit")).click();
        findElement(By.cssSelector(".tab-pane:nth-child(1) .definitionFormatRadio button:nth-child(2)")).click();
        findElement(By.cssSelector("inline-area-edit .fa-check")).click();
        findElement(By.id("openSave")).click();
        findElement(By.name("version")).sendKeys(Keys.BACK_SPACE);
        findElement(By.name("version")).sendKeys("-html"); 
        findElement(By.id("confirmSave")).click();
        goToCdeByName(newCdeName);   
        Assert.assertTrue(textNotPresent("<b>bold</b>"));        
    }    

}
