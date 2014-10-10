package gov.nih.nlm.cde.test;

import org.openqa.selenium.By;
import org.openqa.selenium.Keys;
import org.openqa.selenium.support.ui.ExpectedConditions;
import org.openqa.selenium.support.ui.Select;
import org.testng.Assert;
import org.testng.annotations.Test;

public class CdeEditTest extends NlmCdeBaseTest {
 
    @Test
    public void editCde() {
        mustBeLoggedInAs(ctepCurator_username, password);
        String cdeName = "Mediastinal Lymph Node Physical Examination Specify";
        goToCdeByName(cdeName);
        findElement(By.cssSelector("i.fa-edit")).click();
        findElement(By.xpath("//div[@id='nameEdit']//input")).sendKeys("[name change number 1]");
        findElement(By.cssSelector(".fa-check")).click();
        findElement(By.xpath("//dd[@id = 'dd_def']//i[@class='fa fa-edit']")).click();
        findElement(By.xpath("//div/div[2]/textarea")).sendKeys("[def change number 1]");
        findElement(By.xpath("//dd[@id='dd_def']//button[@class='fa fa-check']")).click();
        findElement(By.xpath("//dd[@id = 'dd_uom']//i[@class = 'fa fa-edit']")).click();
        findElement(By.xpath("//dd[@id = 'dd_uom']//input")).sendKeys("myUom");
        findElement(By.cssSelector("#dd_uom .fa-check")).click();
        findElement(By.cssSelector("button.btn.btn-primary")).click();
        findElement(By.name("changeNote")).sendKeys("Change note for change number 1");
        Assert.assertTrue(textPresent("This version number has already been used"));
        findElement(By.name("version")).sendKeys(".001");
        saveCde();
        goToCdeByName(cdeName);
        Assert.assertTrue(textPresent("[name change number 1]"));
        Assert.assertTrue(textPresent("[def change number 1]"));
        Assert.assertTrue(textPresent("myUom"));
        // test that label and its value are aligned. 
        Assert.assertEquals(findElement(By.id("dt_updated")).getLocation().y, findElement(By.id("dd_updated")).getLocation().y);

        findElement(By.linkText("Identifiers")).click();
        Assert.assertEquals("1.001", findElement(By.id("dd_version_nlm")).getText());                
        
        // Test history
        findElement(By.linkText("History")).click();
        textPresent(cdeName);
        textPresent("Change note for change number 1");
        hangon(1);
        findElement(By.xpath("//table[@id = 'historyTable']//tr[2]//td[4]/a")).click();
        textPresent(cdeName + "[name change number 1]");
        textPresent("the free text field to specify the other type of mediastinal lymph node dissection.[def change number 1]");
        textNotPresent("Permissible Values:");
        
        // View Prior Version
        findElement(By.linkText("History")).click();
        findElement(By.id("prior-0")).click();
        textPresent("1");
        textPresent("Warning: this data element is archived.");
    }

    @Test
    public void cdeHistoryComplement() {
        mustBeLoggedInAs(ctepCurator_username, password);
        goToCdeByName("Metastatic Disease or Disorder Magnetic Resonance Imaging Cerebrospinal Fluid Diagnosis Ind-2");      
        
        findElement(By.linkText("Naming")).click();
        findElement(By.xpath("//button[text()=\" Add Naming\"]")).click();
        modalHere();
        findElement(By.xpath("//label[text()=\"Name\"]/following-sibling::input")).sendKeys("Alternative Name 1");
        findElement(By.xpath("//label[text()=\"Definition\"]/following-sibling::textarea")).sendKeys("Alternative Definition 1");
        findElement(By.xpath("//div[@id='newConceptModalFooter']//button[text()=\"Save\"]")).click();
        modalGone();
        
        findElement(By.linkText("Concepts")).click();
        findElement(By.xpath("//button[text()=\" Add Concept\"]")).click();
        findElement(By.xpath("//label[text()=\"Code Name\"]/following-sibling::input")).sendKeys("Code Name 1");
        findElement(By.xpath("//label[text()=\"Code ID\"]/following-sibling::input")).sendKeys("Code ID 1");
        findElement(By.xpath("//div[@id='newConceptModalFooter']//button[text()=\"Save\"]")).click();       
        modalGone();
        
        
        findElement(By.id("openSave")).click();
        findElement(By.xpath("//label[text()=\"Choose a new version\"]/following-sibling::input")).sendKeys(".1");                
        saveCde();
        
        hangon(1);
        findElement(By.linkText("History")).click();
        findElement(By.xpath("//table[@id = 'historyTable']//tr[2]//td[4]/a")).click();
        Assert.assertTrue(textPresent("Naming:"));
        Assert.assertTrue(textPresent("Added: LOINC, Code Name 1, Code ID 1;"));
        
        goToCdeByName("Metastatic Disease or Disorder Magnetic Resonance Imaging Cerebrospinal Fluid Diagnosis Ind-2");            
        findElement(By.xpath("//i[@id='editStatus']")).click();
        modalHere();
        new Select(findElement(By.xpath("//label[text()=\"Registration Status\"]/following-sibling::select"))).selectByValue("Recorded");
        findElement(By.xpath("//div[@id=\"regStatusModalFooter\"]//button[text()=\"Save\"]")).click();
        modalGone();
        findElement(By.linkText("History")).click();

        findElement(By.xpath("//table[@id = 'historyTable']//tr[3]//td[4]/a")).click();
        Assert.assertTrue(textPresent("Registration State:"));

        findElement(By.linkText("Identifiers")).click();
        findElement(By.xpath("//button[text()=\" Add Identifier\"]")).click();
        modalHere();
        findElement(By.xpath("//label[text()=\"Source\"]/following-sibling::input")).sendKeys("Origin 1");
        findElement(By.xpath("//label[text()=\"Identifier\"]/following-sibling::textarea")).sendKeys("Identifier 1");    
        findElement(By.xpath("//label[text()=\"Version\"]/following-sibling::textarea")).sendKeys("Version 1"); 
        findElement(By.xpath("//div[@id=\"newIdModalFooter\"]//button[text()=\"Save\"]")).click();
        modalGone();
        goToCdeByName("Metastatic Disease or Disorder Magnetic Resonance Imaging Cerebrospinal Fluid Diagnosis Ind-2");   
        findElement(By.linkText("History")).click();
        findElement(By.xpath("//table[@id = 'historyTable']//tr[4]//td[4]/a")).click();
        Assert.assertTrue(textPresent("Identifiers:"));        
    }    
    
    @Test
    public void editConcepts() {
        mustBeLoggedInAs(ctepCurator_username, password);
        String cdeName = "Patient Photograph Malignant";
        
        goToCdeByName(cdeName);
        findElement(By.linkText("Concepts")).click();

        findElement(By.id("addConcept")).click();
        modalHere();
        findElement(By.name("name")).sendKeys("DEC1");
        findElement(By.name("codeId")).sendKeys("DEC_CODE_111");
        findElement(By.id("createConcept")).click();
        hangon(2);
        shortWait.until(ExpectedConditions.elementToBeClickable(By.id("addConcept")));
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
        saveCde();

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
        saveCde();
        
        goToCdeByName(cdeName);
        Assert.assertTrue(!driver.findElement(By.cssSelector("BODY")).getText().contains("DEC1"));
        Assert.assertTrue(!driver.findElement(By.cssSelector("BODY")).getText().contains("OC1"));
        Assert.assertTrue(!driver.findElement(By.cssSelector("BODY")).getText().contains("PROP1"));
    }
    
    @Test
    public void changeDefinitionFormat() {
        mustBeLoggedInAs(ctepCurator_username, password);

        String cdeName = "INSS";
        goToCdeByName(cdeName);
        findElement(By.cssSelector("#dd_def .fa-edit")).click();
        findElement(By.xpath("//div/div[2]/textarea")).sendKeys("[def change: adding html characters][<b>bold</b>]");
        findElement(By.xpath("//dd[@id='dd_def']//button[@class='fa fa-check']")).click();
        findElement(By.id("openSave")).click();
        findElement(By.name("version")).sendKeys(Keys.BACK_SPACE);
        findElement(By.name("version")).sendKeys("-plaintext"); 
        saveCde();

        goToCdeByName(cdeName);   
        Assert.assertTrue(textPresent("<b>bold</b>"));
        findElement(By.cssSelector("#dd_def .fa-edit")).click();
        findElement(By.xpath("//dd[@id='dd_def']//button[text() = 'Rich Text']")).click();
        hangon(2);
        findElement(By.xpath("//dd[@id='dd_def']//button[@class='fa fa-check']")).click();
        findElement(By.id("openSave")).click();
        findElement(By.name("version")).sendKeys(Keys.BACK_SPACE);
        findElement(By.name("version")).sendKeys("-html"); 
        saveCde();
        goToCdeByName(cdeName);   
        Assert.assertTrue(textNotPresent("<b>bold</b>"));        
    }    

    @Test
    public void doNotSaveIfPendingChanges() {   
        mustBeLoggedInAs(ctepCurator_username, password);
        String cdeName = "ATRA Agent Current Report Period Administered Ind-2";
        goToCdeByName(cdeName);
        findElement(By.cssSelector("i.fa-edit")).click();
        findElement(By.xpath("//div[@id='nameEdit']//input")).sendKeys("[name change number 1]");
        findElement(By.cssSelector(".fa-check")).click();
        findElement(By.linkText("Classification")).click();
        
        Assert.assertFalse(findElement(By.id("addClassification")).isEnabled());
        
        findElement(By.linkText("Properties")).click();

        findElement(By.id("addProperty")).click();
        modalHere();
        findElement(By.name("key")).sendKeys("MyKey2");
        findElement(By.name("value")).sendKeys("MyValue2");
        findElement(By.id("createProperty")).click();
        Assert.assertTrue(textPresent("Property added. Save to confirm."));
        modalGone();
        findElement(By.id("removeProperty-0")).click();
        findElement(By.id("confirmRemoveProperty-0")).click();
        Assert.assertTrue(textPresent("Property removed. Save to confirm."));

        findElement(By.linkText("Identifiers")).click();
        findElement(By.id("addId")).click();
        modalHere();
        findElement(By.name("source")).sendKeys("MyOrigin1");
        findElement(By.name("id")).sendKeys("MyId1");
        findElement(By.name("version")).sendKeys("MyVersion1");
        findElement(By.id("createId")).click();
        Assert.assertTrue(textPresent("Identifier added. Save to confirm."));
        modalGone();
        
        findElement(By.id("removeId-1")).click();
        findElement(By.id("confirmRemoveId-1")).click();
        Assert.assertTrue(textPresent("Identifier removed. Save to confirm."));
        
    }
    
    
}
