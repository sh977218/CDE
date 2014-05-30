package gov.nih.nlm.cde.test;

import org.openqa.selenium.By;
import org.openqa.selenium.support.ui.Select;
import org.testng.Assert;
import org.testng.annotations.Test;

public class ClassificationMgtTest extends NlmCdeBaseTest {

    @Test
    public void viewOrgClassifications() {
        mustBeLoggedInAs("classificationMgtUser", "pass");
        findElement(By.id("username_link")).click();
        findElement(By.linkText("Classifications")).click();
        hangon(1);
        new Select(findElement(By.cssSelector("select"))).selectByValue("caBIG");
        Assert.assertTrue(textPresent("gov.nih.nci.cananolab.domain.characterization.invitro"));
        Assert.assertTrue(textNotPresent("Common Terminology Criteria for Adverse Events v3.0"));
        hangon(1);
        new Select(findElement(By.cssSelector("select"))).selectByValue("CTEP");
        Assert.assertTrue(textPresent("Common Terminology Criteria for Adverse Events v3.0"));
        Assert.assertTrue(textNotPresent("gov.nih.nci.cananolab.domain.characterization.invitro"));        
    }

    @Test
    public void createClassificationsMgt() {
        mustBeLoggedInAs("classificationMgtUser", "pass");
        findElement(By.id("username_link")).click();
        findElement(By.linkText("Classifications")).click();
        hangon(1);
        new Select(findElement(By.cssSelector("select"))).selectByValue("CTEP");
        findElement(By.id("addClassification")).click();
        modalHere();
        findElement(By.name("conceptSystem")).sendKeys("DISE");
        findElement(By.xpath("//div[@class='form-group']/ul/li[2]")).click();
        findElement(By.name("concept")).sendKeys("Made up disease");
        findElement(By.id("saveClassification")).click();
        Assert.assertTrue(textPresent("Classification Added"));
        hangon(1);
        Assert.assertTrue(textPresent("Made up disease"));
    }
    
    private void searchNestedClassifiedCdes() {
        goHome();
        findElement(By.name("ftsearch")).sendKeys("classification.elements.elements.elements.name=\"Acute Hospitalized\"");
        findElement(By.id("search.submit")).click();    
    }
    
    private void gotoClassifMgt() {
        findElement(By.id("username_link")).click();
        findElement(By.linkText("Classifications")).click();          
    }
    
    private void checkNestedClassifs() {
        Assert.assertTrue(driver.findElement(By.cssSelector("[id='classification-Disease,Traumatic Brain Injury,Acute Hospitalized'] .name")).getText().equals("Acute Hospitalized"));
        Assert.assertTrue(driver.findElement(By.cssSelector("[id='classification-Disease,Traumatic Brain Injury,Disease/Injury Related Events,History of Disease/Injury Event'] .name")).getText().equals("History of Disease/Injury Event"));
        Assert.assertTrue(driver.findElement(By.cssSelector("[id='classification-Disease,Amyotrophic Lateral Sclerosis,Assessments and Examinations,Physical/Neurological Examination'] .name")).getText().equals("Physical/Neurological Examination"));
        Assert.assertTrue(driver.findElement(By.cssSelector("[id='classification-Disease,Traumatic Brain Injury,Outcomes and End Points,Post-concussive/TBI-Related Symptoms'] .name")).getText().equals("Post-concussive/TBI-Related Symptoms"));    
        
        driver.findElement(By.cssSelector("[id='classification-Disease,Traumatic Brain Injury,Acute Hospitalized,Classification']"));
        driver.findElement(By.cssSelector("[id='classification-Disease,Traumatic Brain Injury,Acute Hospitalized,Classification,Basic']"));
        driver.findElement(By.cssSelector("[id='classification-Disease,Traumatic Brain Injury,Acute Hospitalized,Classification,Core']"));
        driver.findElement(By.cssSelector("[id='classification-Disease,Traumatic Brain Injury,Acute Hospitalized,Classification,Supplemental']"));
    }
    
    private void deleteNestedClassifTree() {
        driver.findElement(By.cssSelector("[id='classification-Disease,Traumatic Brain Injury,Acute Hospitalized'] [title=\"Remove\"]")).click();    
        driver.findElement(By.cssSelector("[id='classification-Disease,Traumatic Brain Injury,Acute Hospitalized'] [title=\"OK\"]")).click();         
        Assert.assertTrue(textPresent("Classification Deleted"));
        Assert.assertTrue(textNotPresent("Acute Hospitalized"));
        checkElementDoesNotExistByCSS("[id='classification-Disease,Traumatic Brain Injury,Acute Hospitalized,Classification']");
        checkElementDoesNotExistByCSS("[id='classification-Disease,Traumatic Brain Injury,Acute Hospitalized,Classification,Basic']");
        checkElementDoesNotExistByCSS("[id='classification-Disease,Traumatic Brain Injury,Acute Hospitalized,Classification,Core']");
        checkElementDoesNotExistByCSS("[id='classification-Disease,Traumatic Brain Injury,Acute Hospitalized,Classification,Supplemental']");
    }
    
    @Test
    public void removeClassificationMgt() {
        mustBeLoggedInAs("ninds", "pass");
        searchNestedClassifiedCdes();
        Assert.assertTrue(textPresent("NINDS (24)"));
        gotoClassifMgt();
        
        checkNestedClassifs();
        deleteNestedClassifTree();  
        searchNestedClassifiedCdes();
        hangon(3);
        Assert.assertTrue(textNotPresent("NINDS (24)"));
    }
}
