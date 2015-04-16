package gov.nih.nlm.cde.test;

import gov.nih.nlm.system.NlmCdeBaseTest;
import org.openqa.selenium.By;
import org.openqa.selenium.support.ui.ExpectedConditions;
import org.testng.annotations.Test;

public class CdeEdit2Test extends NlmCdeBaseTest {

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
        findElement(By.id("cancelSaveModal")).click();
        modalGone();
        findElement(By.id("discardChanges")).click();
        wait.until(ExpectedConditions.invisibilityOfElementLocated(By.id("discardChanges")));          
    }   
    
}
