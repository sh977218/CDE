package gov.nih.nlm.cde.test;

import static gov.nih.nlm.cde.test.NlmCdeBaseTest.ctepCurator_username;
import org.openqa.selenium.By;
import org.openqa.selenium.support.ui.Select;
import org.testng.Assert;
import org.testng.annotations.Test;

public class CdeEdit2Test extends NlmCdeBaseTest {
 
   @Test
    public void cdeHistoryComplement() {
        mustBeLoggedInAs(ctepCurator_username, password);
        goToCdeByName("Metastatic Disease or Disorder Magnetic Resonance Imaging Cerebrospinal Fluid Diagnosis Ind-2");      
        
        findElement(By.linkText("Naming")).click();
        findElement(By.xpath("//button[text()=\" Add Naming\"]")).click();
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
        
        newCdeVersion();
        
        findElement(By.linkText("History")).click();
        showHistoryDiff(0);
        confirmFieldName("Concepts");
        confirmNewValue("LOINC");
        confirmNewValue("Code Name 1");
        confirmNewValue("Code ID 1");
        
        confirmFieldName("Naming");
        confirmNewValue("Alternative Name 1");
        confirmNewValue("Alternative Definition 1");

        
        goToCdeByName("Metastatic Disease or Disorder Magnetic Resonance Imaging Cerebrospinal Fluid Diagnosis Ind-2");            
        findElement(By.xpath("//i[@id='editStatus']")).click();
        new Select(findElement(By.xpath("//label[text()=\"Registration Status\"]/following-sibling::select"))).selectByValue("Recorded");
        findElement(By.xpath("//div[@id=\"regStatusModalFooter\"]//button[text()=\"Save\"]")).click();
        modalGone();
        
        checkInHistory("Registration State", "Qualified", "Recorded");

        findElement(By.linkText("Identifiers")).click();
        closeAlert();
        findElement(By.xpath("//button[text()=\" Add Identifier\"]")).click();
        findElement(By.xpath("//label[text()=\"Source\"]/following-sibling::input")).sendKeys("Origin 1");
        findElement(By.xpath("//label[text()=\"Identifier\"]/following-sibling::textarea")).sendKeys("Identifier 1");    
        findElement(By.xpath("//label[text()=\"Version\"]/following-sibling::textarea")).sendKeys("Version 1"); 
        findElement(By.xpath("//div[@id=\"newIdModalFooter\"]//button[text()=\"Save\"]")).click();
        modalGone();
        goToCdeByName("Metastatic Disease or Disorder Magnetic Resonance Imaging Cerebrospinal Fluid Diagnosis Ind-2", "Recorded");   
        findElement(By.linkText("History")).click();
        showHistoryDiff(0);
        confirmFieldName("Identifiers");        
        confirmNewValue("Origin 1");
        confirmNewValue("Identifier 1");
        confirmNewValue("Version 1");
        
    }        
    
    @Test
    public void changeDefinitionFormat() {
        mustBeLoggedInAs(ctepCurator_username, password);

        String cdeName = "INSS";
        goToCdeByName(cdeName);
        findElement(By.cssSelector("#dd_def .fa-edit")).click();
        findElement(By.xpath("//div/div[2]/textarea")).sendKeys("[def change: adding html characters][<b>bold</b>]");
        findElement(By.xpath("//dd[@id='dd_def']//button[@class='fa fa-check']")).click();
        newCdeVersion();

        textPresent("<b>bold</b>");
        findElement(By.cssSelector("#dd_def .fa-edit")).click();
        findElement(By.xpath("//dd[@id='dd_def']//button[text() = 'Rich Text']")).click();
        hangon(2);
        findElement(By.xpath("//dd[@id='dd_def']//button[@class='fa fa-check']")).click();
        newCdeVersion();
        textNotPresent("<b>bold</b>");        
    }    

    
    @Test
    public void editCdeByTinyId() {
        mustBeLoggedInAs(ninds_username, password);
        String cdeName = "Left Lymph Node Positive Total Count";
        driver.get(baseUrl + "/#/deview?tinyId=SPFteb8X6aB");
        findElement(By.cssSelector("i.fa-edit")).click();
        findElement(By.xpath("//div[@id='nameEdit']//input")).sendKeys("[name change number 1]");
        findElement(By.cssSelector(".fa-check")).click();
        newCdeVersion("Change note for change number 1");
        driver.get(baseUrl + "/#/deview?tinyId=SPFteb8X6aB");
        textPresent("General Details");
        textPresent("[name change number 1]");
              
    }    
    
    @Test
    public void versionNumberValidator() {
        mustBeLoggedInAs(ninds_username, password);
        String cdeName = "Operating room total time";        
        String validationError = "Version number cannot";
        goToCdeByName(cdeName);
        findElement(By.cssSelector("i.fa-edit")).click();
        findElement(By.xpath("//div[@id='nameEdit']//input")).sendKeys("[name change number 2]");
        findElement(By.cssSelector(".fa-check")).click();        
        findElement(By.id("openSave")).click();
        hangon(1);
        textNotPresent(validationError);
        findElement(By.name("version")).sendKeys("/23");
        textPresent(validationError);
        findElement(By.name("version")).clear();
        textNotPresent(validationError);
        findElement(By.name("version")).sendKeys("123#abc");
        textPresent(validationError);
    }   
    
}
