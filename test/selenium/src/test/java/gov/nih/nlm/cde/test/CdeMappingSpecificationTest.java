package gov.nih.nlm.cde.test;

import org.openqa.selenium.By;
import org.testng.Assert;
import org.testng.annotations.Test;

public class CdeMappingSpecificationTest extends NlmCdeBaseTest {


    @Test
    public void nonOwnerCantEdit() {
        String cdeName = "Tooth Sensitivity Mastication Second Oral Cavity Quadrant Assessment Scale";
        mustBeLoggedInAs(ninds_username, password);
        goToCdeByName(cdeName);
        findElement(By.linkText("Mappings")).click();
        Assert.assertFalse(findElement(By.id("addMappingSpecification")).isDisplayed());
    }
    
    @Test
    public void addRemoveCdeProperty() {
        mustBeLoggedInAs(ninds_username, password);
        String cdeName = "Alcohol Smoking and Substance Use Involvement Screening Test (ASSIST) - Hallucinogen problem frequency";

        //test add
        goToCdeByName(cdeName);
        findElement(By.linkText("Mappings")).click();
        
        findElement(By.id("addMappingSpecification")).click();
        
        findElement(By.id("mappingSpecification.content")).sendKeys("MS Content 1");
        findElement(By.id("mappingSpecification.type")).sendKeys("MS type 1");
        findElement(By.id("mappingSpecification.script")).sendKeys("MS script 1");
        
        findElement(By.id("okCreate")).click();
        textPresent("Mapping Specification Added");
        closeAlert();
        
        findElement(By.id("addMappingSpecification")).click();
        
        findElement(By.id("mappingSpecification.content")).sendKeys("Content");
        findElement(By.xpath("//li/a[text()=\"MS Content 1'\"]"));
    
        findElement(By.id("cancelCreate")).click();

        findElement(By.id("removeMappingSpecification-0")).click();
        findElement(By.id("confirmRemoveMappingSpecification-0")).click();
        
        textPresent("There are no mapping specifications");
        
    }
    
    
}
