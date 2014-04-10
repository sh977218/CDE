package gov.nih.nlm.cde.test;

import static gov.nih.nlm.cde.test.NlmCdeBaseTest.ctepCurator_username;
import static gov.nih.nlm.cde.test.NlmCdeBaseTest.driver;
import static gov.nih.nlm.cde.test.NlmCdeBaseTest.wait;
import java.util.List;
import org.openqa.selenium.By;
import org.openqa.selenium.Keys;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.support.ui.ExpectedConditions;
import org.testng.Assert;
import org.testng.annotations.AfterClass;
import org.testng.annotations.BeforeClass;
import org.testng.annotations.Test;

/**
 *
 * @author ludetc
 */
public class ValueDomainTest extends NlmCdeBaseTest {
    
    @BeforeClass
    public void login() {
        loginAs(ctepCurator_username, ctepCurator_password);
    }

    @AfterClass
    public void logMeOut() {
        logout();
    }
    
    /*@Test
    public void assignVsacId() {
        goToCdeByName("Patient Ethnic Group Category");
        findElement(By.linkText("Permissible Values")).click();
        Assert.assertTrue(textPresent("No Value Set specified."));
        findElement(By.linkText("Update O.I.D")).click();
        findElement(By.name("vsacId")).sendKeys("invalidId");
        findElement(By.id("vsacIdCheck")).click();
        Assert.assertTrue(textPresent("Invalid VSAC OID"));
        findElement(By.linkText("Update O.I.D")).click();
        findElement(By.name("vsacId")).sendKeys("2.16.840.1.114222.4.11.837");
        findElement(By.id("vsacIdCheck")).click();
        // check that version got fetched.
        Assert.assertTrue(textPresent("20121025"));
        findElement(By.cssSelector("button.btn.btn-primary")).click();
        findElement(By.name("changeNote")).sendKeys("Adding vsac Id");
        Assert.assertTrue(textPresent("This version number has already been used"));
        findElement(By.name("version")).sendKeys(Keys.BACK_SPACE);
        findElement(By.name("version")).sendKeys("3");
        findElement(By.id("confirmSave")).click();
        hangon(2);
        
        goToCdeByName("Patient Ethnic Group Category");
        findElement(By.linkText("Permissible Values")).click();
        Assert.assertTrue(textPresent("20121025"));
        Assert.assertTrue(textPresent("2135-2"));
        Assert.assertTrue(textPresent("CDCREC"));
        WebElement tbody = driver.findElement(By.id("vsacTableBody"));
        List<WebElement> vsacLines = tbody.findElements(By.tagName("tr"));
        Assert.assertEquals(vsacLines.size(), 2);
        
        goToCdeByName("Patient Ethnic Group Category");
        findElement(By.linkText("Permissible Values")).click();   
        wait.until(ExpectedConditions.visibilityOfElementLocated(By.xpath("//td[@id='pvName-1']//i")));
        findElement(By.xpath("//td[@id='pvName-1']/div/div[1]/i")).click();
        findElement(By.xpath("//td[@id='pvName-1']//input")).sendKeys(Keys.BACK_SPACE);
        findElement(By.xpath("//td[@id='pvName-1']//input")).sendKeys("o");
        findElement(By.xpath("//td[@id = 'pvName-1']/div/div[2]/ul/li[1]")).click();
        findElement(By.xpath("//td[@id='pvName-1']/div/div[2]/a[1]")).click();
        findElement(By.cssSelector("button.btn.btn-primary")).click();
        findElement(By.name("version")).sendKeys(Keys.BACK_SPACE);
        findElement(By.name("version")).sendKeys("6");
        findElement(By.cssSelector("button.btn.btn-warning")).click();
        goHome();
        findElement(By.name("ftsearch")).sendKeys("Patient Ethnic Group Category");
        findElement(By.id("search.submit")).click();
        findElement(By.partialLinkText("Patient Ethnic Group Category")).click();
        Assert.assertTrue(textPresent("2135-2"));
        
        goToCdeByName("Patient Ethnic Group Category");
        findElement(By.linkText("Permissible Values")).click(); 
        wait.until(ExpectedConditions.visibilityOfElementLocated(By.id("pv-0-warning")));
        wait.until(ExpectedConditions.visibilityOfElementLocated(By.id("pv-1-valid")));
        wait.until(ExpectedConditions.visibilityOfElementLocated(By.id("pv-2-warning")));
        wait.until(ExpectedConditions.visibilityOfElementLocated(By.id("pv-3-warning")));
        wait.until(ExpectedConditions.visibilityOfElementLocated(By.id("vset-0-valid")));
        wait.until(ExpectedConditions.visibilityOfElementLocated(By.id("vset-1-warning")));
        
        goToCdeByName("Patient Ethnic Group Category");
        findElement(By.linkText("Permissible Values")).click();
        // following asserts
        wait.until(ExpectedConditions.visibilityOfElementLocated(By.xpath("//td[@id='pvName-1']//i")));
        goToCdeByName("Involved Organ Laterality Type");
        findElement(By.linkText("Permissible Values")).click();
        // following asserts
        wait.until(ExpectedConditions.invisibilityOfElementLocated(By.xpath("//td[@id='pvName-1']//i"))); 
    }
    
    @Test
    public void removeVsacId() {
        goToCdeByName("Left Colon Excision Ind-2");
        findElement(By.linkText("Permissible Values")).click();   
        findElement(By.linkText("Update O.I.D")).click();
        findElement(By.name("vsacId")).sendKeys("2.16.840.1.114222.4.11.837");
        findElement(By.id("vsacIdCheck")).click();
        
        wait.until(ExpectedConditions.visibilityOfElementLocated(By.id("removeVSButton")));
        
        findElement(By.cssSelector("button.btn.btn-primary")).click();
        findElement(By.name("version")).sendKeys(".1");
        findElement(By.id("confirmSave")).click();
        hangon(2);

        goToCdeByName("Left Colon Excision Ind-2");
        findElement(By.linkText("Permissible Values")).click();   
        findElement(By.id("removeVSButton")).click();

        wait.until(ExpectedConditions.invisibilityOfElementLocated(By.id("removeVSButton")));
        Assert.assertEquals(driver.findElement(By.cssSelector("BODY")).getText().indexOf("2.16.840.1.114222.4.11.837"), -1);

        findElement(By.cssSelector("button.btn.btn-primary")).click();
        findElement(By.name("version")).sendKeys(Keys.BACK_SPACE);
        findElement(By.name("version")).sendKeys("2");
        findElement(By.id("confirmSave")).click();
        hangon(2);
        
        goToCdeByName("Left Colon Excision Ind-2");
        findElement(By.linkText("Permissible Values")).click();   
        wait.until(ExpectedConditions.invisibilityOfElementLocated(By.id("removeVSButton")));
    }
    
    
    @Test
    public void changePermissibleValue() {
        goToCdeByName("Patient Ethnic Group Category");
        findElement(By.linkText("Permissible Values")).click(); 
        wait.until(ExpectedConditions.visibilityOfElementLocated(By.xpath("//td[@id='pv-0']/inline-edit/span/span[1]/i")));
        findElement(By.xpath("//td[@id='pv-0']/inline-edit/span/span[1]/i")).click();
        findElement(By.xpath("//td[@id='pv-0']/inline-edit/span/span[2]/input")).sendKeys(" added to pv");
        findElement(By.cssSelector("#pv-0 .fa-check")).click();
        findElement(By.cssSelector("button.btn.btn-primary")).click();
        findElement(By.name("changeNote")).sendKeys("Changed PV");
        findElement(By.name("version")).sendKeys(Keys.BACK_SPACE);
        findElement(By.name("version")).sendKeys("4");
        findElement(By.cssSelector("button.btn.btn-warning")).click();
        goToCdeByName("Patient Ethnic Group Category");
        findElement(By.linkText("Permissible Values")).click();
        Assert.assertTrue(textPresent("added to pv"));
    }
    
    @Test
    public void addRemovePv() {
        goToCdeByName("Surgical Procedure Hand Laparoscopic Port Anatomic Site");
        findElement(By.linkText("Permissible Values")).click();
        Assert.assertTrue(textPresent("Right Middle Abdomen"));
        findElement(By.id("pvRemove-8")).click();
        findElement(By.id("addPv")).click();
        findElement(By.xpath("//td[@id='pv-10']/inline-edit/span/span[1]/i")).click();
        findElement(By.xpath("//td[@id='pv-10']/inline-edit/span/span[2]/input")).clear();
        findElement(By.xpath("//td[@id='pv-10']/inline-edit/span/span[2]/input")).sendKeys("New PV");
        findElement(By.cssSelector("#pv-10 .fa-check")).click();
        findElement(By.cssSelector("button.btn.btn-primary")).click();
        findElement(By.name("changeNote")).sendKeys("Changed PV");
        findElement(By.name("version")).sendKeys(Keys.BACK_SPACE);
        findElement(By.name("version")).sendKeys(".addRemovePv");
        findElement(By.cssSelector("button.btn.btn-warning")).click();
        goToCdeByName("Surgical Procedure Hand Laparoscopic Port Anatomic Site");
        findElement(By.linkText("Permissible Values")).click();
        Assert.assertTrue(textPresent("New PV"));
        Assert.assertEquals(driver.findElement(By.cssSelector("BODY")).getText().indexOf("Right Middle Abdomen"), -1);
    }
    
    @Test
    public void reOrderPv() {
        goToCdeByName("Involved Organ Laterality Type");
        findElement(By.linkText("Permissible Values")).click();
        wait.until(ExpectedConditions.textToBePresentInElementLocated(By.id("pvCode-2"), "C25229"));
        Assert.assertEquals(findElement(By.id("pvCode-6")).getText(), "C25594,C48046,C13717");
        findElement(By.id("pvUp-2")).click();
        findElement(By.id("pvDown-6")).click();
        findElement(By.id("openSave")).click();
        findElement(By.name("changeNote")).sendKeys("Reordered PV");
        findElement(By.name("version")).sendKeys(".addRemovePv");
        findElement(By.id("confirmSave")).click();
        goToCdeByName("Involved Organ Laterality Type");
        findElement(By.linkText("Permissible Values")).click();
        Assert.assertEquals(findElement(By.id("pvCode-1")).getText(), "C25229");
        Assert.assertEquals(findElement(By.id("pvCode-7")).getText(), "C25594,C48046,C13717");
    }
    
    @Test
    public void randomDatatype() {
        goToCdeByName("Axillary Surgery");
        findElement(By.linkText("Permissible Values")).click();
        wait.until(ExpectedConditions.visibilityOfElementLocated(By.id("editDatatype")));
        findElement(By.id("editDatatype")).click();
        findElement(By.name("datatypeFreeText")).clear();
        findElement(By.name("datatypeFreeText")).sendKeys("java.lang.Date");
        findElement(By.id("confirmDatatype")).click();
        findElement(By.id("openSave")).click();
        findElement(By.name("version")).sendKeys(".1");
        modalHere();
        findElement(By.id("confirmSave")).click();
        goToCdeByName("Axillary Surgery");
        findElement(By.linkText("Permissible Values")).click();        
        Assert.assertTrue(textPresent("java.lang.Date"));
    }*/
    
    @Test
    public void importVsacValues() {
        goToCdeByName("Patient Race Category");
        findElement(By.linkText("Permissible Values")).click();         
        Assert.assertTrue(textPresent("Native Hawaiian or other Pacific Islander"));    
        findElement(By.id("removeAllPvs")).click();
        Assert.assertTrue(textNotPresent("Native Hawaiian or other Pacific Islander"));        
        findElement(By.linkText("Update O.I.D")).click();
        findElement(By.name("vsacId")).sendKeys("2.16.840.1.114222.4.11.836");
        findElement(By.id("vsacIdCheck")).click();
        wait.until(ExpectedConditions.visibilityOfElementLocated(By.id("vset-0-warning")));
        findElement(By.id("addVsacValue-0")).click();
        wait.until(ExpectedConditions.visibilityOfElementLocated(By.id("vset-0-valid")));
        findElement(By.id("addAllVsac")).click();
        wait.until(ExpectedConditions.visibilityOfElementLocated(By.id("vset-1-valid")));   
        wait.until(ExpectedConditions.visibilityOfElementLocated(By.id("vset-2-valid")));
        wait.until(ExpectedConditions.visibilityOfElementLocated(By.id("vset-3-valid")));
        findElement(By.id("pvRemove-0")).click();
        wait.until(ExpectedConditions.visibilityOfElementLocated(By.id("vset-0-warning")));        
        
        findElement(By.cssSelector("button.btn.btn-primary")).click();
        findElement(By.name("changeNote")).sendKeys("Importing All VSAC Values");
        findElement(By.name("version")).sendKeys(Keys.BACK_SPACE);
        findElement(By.name("version")).sendKeys("5");        
        findElement(By.id("confirmSave")).click();
        hangon(2);
        
        goToCdeByName("Patient Race Category");
        findElement(By.linkText("Permissible Values")).click(); 
        wait.until(ExpectedConditions.visibilityOfElementLocated(By.id("vset-0-warning")));
        wait.until(ExpectedConditions.visibilityOfElementLocated(By.id("vset-1-valid")));   
        wait.until(ExpectedConditions.visibilityOfElementLocated(By.id("vset-2-valid")));
        wait.until(ExpectedConditions.visibilityOfElementLocated(By.id("vset-3-valid")));        
    }  
   
    @Test(dependsOnMethods = {"importVsacValues"})
    public void modifyValueCode() {
        goToCdeByName("Patient Race Category");
        findElement(By.linkText("Permissible Values")).click();         
        wait.until(ExpectedConditions.visibilityOfElementLocated(By.id("pv-4-valid")));
        findElement(By.cssSelector("#pvName-4 .fa-edit")).click(); 
        findElement(By.cssSelector("#pvName-4 input")).sendKeys(" Category");
        findElement(By.cssSelector("#pvName-4 .fa-check")).click();
        hangon(1);
        wait.until(ExpectedConditions.visibilityOfElementLocated(By.id("pv-4-warning")));
        
        findElement(By.cssSelector("#pvCode-4 .fa-edit")).click(); 
        findElement(By.cssSelector("#pvCode-4 input")).sendKeys(".1");
        findElement(By.cssSelector("#pvCode-4 .fa-check")).click();  
        
        findElement(By.cssSelector("#pvCodeSystem-4 .fa-edit")).click(); 
        findElement(By.cssSelector("#pvCodeSystem-4 input")).sendKeys(".1");
        findElement(By.cssSelector("#pvCodeSystem-4 .fa-check")).click();        
        
        findElement(By.cssSelector("button.btn.btn-primary")).click();
        findElement(By.name("changeNote")).sendKeys("Modified VS Codes");
        findElement(By.name("version")).sendKeys(Keys.BACK_SPACE);
        findElement(By.name("version")).sendKeys("6");        
        findElement(By.id("confirmSave")).click();
        hangon(2);
        
        goToCdeByName("Patient Race Category");  
        findElement(By.linkText("Permissible Values")).click();
        Assert.assertTrue(textPresent("Other Race Category"));
        Assert.assertTrue(textPresent("2131-1.1"));
        Assert.assertTrue(textPresent("CDCREC.1"));
    }     
}
