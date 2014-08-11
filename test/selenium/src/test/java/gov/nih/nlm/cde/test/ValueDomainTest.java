package gov.nih.nlm.cde.test;

import static gov.nih.nlm.cde.test.NlmCdeBaseTest.ctepCurator_username;
import static gov.nih.nlm.cde.test.NlmCdeBaseTest.driver;
import static gov.nih.nlm.cde.test.NlmCdeBaseTest.wait;
import org.openqa.selenium.By;
import org.openqa.selenium.Keys;
import org.openqa.selenium.support.ui.ExpectedConditions;
import org.testng.Assert;
import org.testng.annotations.Test;

public class ValueDomainTest extends NlmCdeBaseTest {
    
    @Test
    public void changePermissibleValue() {
        String cdeName = "Additional Pathologic Findings Chronic Proctocolitis Indicator";
        mustBeLoggedInAs(ctepCurator_username, ctepCurator_password);
        goToCdeByName(cdeName);
        findElement(By.linkText("Permissible Values")).click(); 
        wait.until(ExpectedConditions.visibilityOfElementLocated(By.xpath("//td[@id='pv-0']/div/span/span[1]/i")));
        findElement(By.cssSelector("#pv-0 .fa-edit")).click();
        findElement(By.cssSelector("#pv-0 input")).sendKeys(" added to pv");
        findElement(By.cssSelector("#pv-0 .fa-check")).click();
        findElement(By.cssSelector("button.btn.btn-primary")).click();
        findElement(By.name("changeNote")).sendKeys("Changed PV");
        findElement(By.name("version")).sendKeys(Keys.BACK_SPACE);
        findElement(By.name("version")).sendKeys("4");
        findElement(By.cssSelector("button.btn.btn-warning")).click();
        modalGone();
        goToCdeByName(cdeName);
        findElement(By.linkText("Permissible Values")).click();
        Assert.assertTrue(textPresent("added to pv"));
        findElement(By.linkText("History")).click();
        hangon(1);
        findElement(By.xpath("//table[@id = 'historyTable']//tr[2]//td[4]/a")).click();
        Assert.assertTrue(textPresent("Permissible Values:"));
        Assert.assertTrue(textPresent("Modified"));
    }
    
    @Test
    public void addRemovePv() {
        String cdeName = "Surgical Procedure Hand Laparoscopic Port Anatomic Site";
        mustBeLoggedInAs(ctepCurator_username, ctepCurator_password);
        goToCdeByName(cdeName);
        findElement(By.linkText("Permissible Values")).click();
        Assert.assertTrue(textPresent("Right Middle Abdomen"));
        findElement(By.id("pvRemove-8")).click();
        findElement(By.id("addPv")).click();
        findElement(By.xpath("//td[@id='pv-10']//i")).click();
        findElement(By.xpath("//td[@id='pv-10']//input")).clear();
        findElement(By.xpath("//td[@id='pv-10']//input")).sendKeys("New PV");
        findElement(By.cssSelector("#pv-10 .fa-check")).click();
        
        findElement(By.cssSelector("#pv-10 [typeahead-source=\"pVTypeaheadCodeSystemNameList\"] .fa-edit")).click();
        Assert.assertTrue(textPresent("Confirm"));
        findElement(By.xpath("//td[@id='pvCodeSystem-10']//input")).sendKeys("N");
        Assert.assertTrue(textPresent("NCI Thesaurus"));
        findElement(By.cssSelector("button.btn.btn-primary")).click();
        findElement(By.name("changeNote")).sendKeys("Changed PV");
        findElement(By.name("version")).sendKeys(Keys.BACK_SPACE);
        findElement(By.name("version")).sendKeys(".addRemovePv");
        findElement(By.id("confirmSave")).click();
        textPresent("Qualified");
        goToCdeByName(cdeName);
        findElement(By.linkText("Permissible Values")).click();
        Assert.assertTrue(textPresent("New PV"));
        Assert.assertEquals(driver.findElement(By.cssSelector("BODY")).getText().indexOf("Right Middle Abdomen"), -1);
    }
    
    @Test
    public void reOrderPv() {
        mustBeLoggedInAs(ctepCurator_username, ctepCurator_password);
        goToCdeByName("Involved Organ Laterality Type");
        findElement(By.linkText("Permissible Values")).click();
        wait.until(ExpectedConditions.textToBePresentInElementLocated(By.id("pvCode-2"), "C25229"));
        Assert.assertEquals(findElement(By.id("pvCode-6")).getText(), "C25594,C48046,C13717");
        findElement(By.id("pvUp-2")).click();
        findElement(By.id("pvDown-6")).click();
        findElement(By.id("openSave")).click();
        findElement(By.name("changeNote")).sendKeys("Reordered PV");
        findElement(By.name("version")).sendKeys(".addRemovePv");
        saveCde();
        goToCdeByName("Involved Organ Laterality Type");
        findElement(By.linkText("Permissible Values")).click();
        Assert.assertEquals(findElement(By.id("pvCode-1")).getText(), "C25229");
        Assert.assertEquals(findElement(By.id("pvCode-7")).getText(), "C25594,C48046,C13717");
    }
    
    @Test
    public void randomDatatype() {
        mustBeLoggedInAs(ctepCurator_username, ctepCurator_password);
        String cdeName = "CTC Adverse Event Apnea Grade";
        goToCdeByName(cdeName);
        findElement(By.linkText("Permissible Values")).click();
        wait.until(ExpectedConditions.visibilityOfElementLocated(By.id("editDatatype")));
        findElement(By.id("editDatatype")).click();
        findElement(By.name("datatypeFreeText")).clear();
        findElement(By.name("datatypeFreeText")).sendKeys("java.lang.Date");
        findElement(By.id("confirmDatatype")).click();
        findElement(By.id("openSave")).click();
        findElement(By.name("version")).sendKeys(".1");
        modalHere();
        saveCde();
        goToCdeByName(cdeName);
        findElement(By.linkText("Permissible Values")).click();        
        Assert.assertTrue(textPresent("java.lang.Date"));
    }  
    
    @Test
    public void longPvList() {
        goToCdeByName("Common Toxicity Criteria Adverse Event Short Name Type");
        findElement(By.linkText("Permissible Values")).click();         
        Assert.assertTrue(textPresent("Hemoglobinuria"));
        Assert.assertTrue(textNotPresent("Hypermagnesemia"));
        findElement(By.id("showMorePvs")).click();
        Assert.assertTrue(textPresent("Hypermagnesemia"));
    }
    
    @Test
    public void hideProprietaryPv() {
        mustBeLoggedInAs("ninds", "pass");        
        goToCdeByName("Post traumatic amnesia duration range");
        findElement(By.linkText("Permissible Values")).click();         
        findElement(By.cssSelector("#pvCodeSystem-0 .fa-edit")).click();
        findElement(By.xpath("//td[@id='pvCodeSystem-0']//input")).sendKeys("SNOMEDCT");
        findElement(By.cssSelector("#pvCodeSystem-0 .fa-check")).click();
        findElement(By.id("openSave")).click();
        findElement(By.name("version")).sendKeys(".1");
        saveCde();
        
        mustBeLoggedInAs("ninds", "pass"); 
        goToCdeByName("Post traumatic amnesia duration range");
        findElement(By.linkText("Permissible Values")).click();
        Assert.assertTrue(textPresent("SNOMEDCT"));
       
        logout();
        goToCdeByName("Post traumatic amnesia duration range");
        findElement(By.linkText("Permissible Values")).click();
        Assert.assertTrue(textNotPresent("SNOMEDCT"));
        Assert.assertTrue(textPresent("Login to see the value."));        
    }    
    
    @Test
    public void multiValue() {              
        String cdeName = "Cambridge-Hopkins Restless Legs Syndrome Diagnostic Questionnaire (CH-RLSQ) - feeling most occur time";
        openCdeInList(cdeName);
        Assert.assertTrue(textPresent("Multiple Values:"));
        mustBeLoggedInAs("ninds", "pass");
        goToCdeByName(cdeName);
        findElement(By.linkText("Permissible Values")).click();
        Assert.assertTrue(findElement(By.id("multipleValues_input")).isSelected());

        cdeName = "Imaging perfusion computed tomography based identification core method type";
        
        openCdeInList(cdeName);
        Assert.assertTrue(textNotPresent("Multiple Values:"));
        goToCdeByName(cdeName);
        findElement(By.linkText("Permissible Values")).click();
        Assert.assertFalse(findElement(By.id("multipleValues_input")).isSelected());
        findElement(By.id("multipleValues_input")).click();
        
        findElement(By.id("openSave")).click();
        findElement(By.name("version")).sendKeys(".1");
        modalHere();
        saveCde();

        goToCdeByName(cdeName);
        findElement(By.linkText("Permissible Values")).click();
        wait.until(ExpectedConditions.elementSelectionStateToBe(findElement(By.id("multipleValues_input")), true));
    }
    
    @Test
    public void otherPleaseSpecifyAndListDatatype() {
        mustBeLoggedInAs("ninds", "pass");        
        String cdeName = "Structured Clinical Interview for Pathological Gambling (SCI-PG) - withdrawal value";
        goToCdeByName(cdeName);
        findElement(By.linkText("Permissible Values")).click();
        Assert.assertFalse(findElement(By.id("otherPleaseSpecify_input")).isSelected());
        Assert.assertTrue(textNotPresent("Please Specify Text"));
        findElement(By.id("otherPleaseSpecify_input")).click();
        Assert.assertTrue(findElement(By.id("otherPleaseSpecify_input")).isSelected());
        
        findElement(By.id("listDatatype_pencil")).click();
        findElement(By.id("listDatatype_input")).sendKeys("Some DT");
        findElement(By.id("confirmListType")).click();
        
        findElement(By.id("openSave")).click();
        findElement(By.name("version")).sendKeys(".1");
        modalHere();
        saveCde();

        goToCdeByName(cdeName);
        findElement(By.linkText("Permissible Values")).click();
        Assert.assertTrue(textPresent("Some DT"));
        wait.until(ExpectedConditions.elementSelectionStateToBe(findElement(By.id("otherPleaseSpecify_input")), true));
        Assert.assertTrue(textPresent("Please Specify Text"));
        findElement(By.xpath("//div[@id='otherPleaseSpecifyText_input']//i")).click();
        findElement(By.xpath("//div[@id='otherPleaseSpecifyText_input']//input")).clear();
        findElement(By.xpath("//div[@id='otherPleaseSpecifyText_input']//input")).sendKeys("Other Answer");
        findElement(By.xpath("//div[@id='otherPleaseSpecifyText_input']//button[@class='fa fa-check']")).click();

        findElement(By.id("openSave")).click();
        findElement(By.name("version")).sendKeys(".1");
        modalHere();
        saveCde();
        
        goToCdeByName(cdeName);
        findElement(By.linkText("Permissible Values")).click();
        Assert.assertTrue(textPresent("Other Answer"));
        
    }    
}
