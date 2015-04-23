package gov.nih.nlm.cde.test;

import gov.nih.nlm.system.NlmCdeBaseTest;
import org.openqa.selenium.By;
import org.openqa.selenium.TimeoutException;
import org.openqa.selenium.support.ui.ExpectedConditions;
import org.testng.annotations.Test;

public class CdeMappingSpecificationTest extends NlmCdeBaseTest {


    @Test
    public void nonOwnerCantEdit() {
        String cdeName = "Tooth Sensitivity Mastication Second Oral Cavity Quadrant Assessment Scale";
        mustBeLoggedInAs(ninds_username, password);
        goToCdeByName(cdeName);
        findElement(By.linkText("Mappings")).click();
        shortWait.until(ExpectedConditions.invisibilityOfElementLocated(By.id("addMappingSpecification")));
    }
    
    @Test
    public void addRemoveMappingSpecification() {
        mustBeLoggedInAs(ninds_username, password);
        String cdeName = "Alcohol Smoking and Substance Use Involvement Screening Test (ASSIST) - Hallucinogen problem frequency";

        //test add
        goToCdeByName(cdeName);
        findElement(By.linkText("Mappings")).click();
        
        findElement(By.id("addMappingSpecification")).click();
        
        findElement(By.id("newMappingSpecification.content")).sendKeys("MS Content 1");
        findElement(By.id("newMappingSpecification.type")).sendKeys("MS type 1");
        findElement(By.id("newMappingSpecification.script")).sendKeys("MS script 1");
        
        findElement(By.id("createMappingSpecification")).click();
        textPresent("Mapping Specification Added");
        closeAlert();
        
        goToCdeByName(cdeName);
        findElement(By.linkText("Mappings")).click();
        findElement(By.id("addMappingSpecification")).click();
        findElement(By.id("newMappingSpecification.content")).sendKeys("Content");
        try {
            findElement(By.xpath("//li/a/strong[contains(text(), 'Content')]"));
        } catch (TimeoutException e) {
            goToCdeByName(cdeName);
            findElement(By.linkText("Mappings")).click();
            findElement(By.id("addMappingSpecification")).click();
            findElement(By.id("newMappingSpecification.content")).sendKeys("Content");            
        }
            
        findElement(By.id("cancelCreate")).click();
        modalGone();

        findElement(By.id("removeMappingSpecification-0")).click();
        findElement(By.id("confirmRemoveMappingSpecification-0")).click();
        
        textPresent("There are no mapping specifications");
        hangon(1);
        
    }
    
    
}
