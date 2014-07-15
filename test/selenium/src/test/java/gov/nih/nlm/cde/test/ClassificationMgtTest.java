package gov.nih.nlm.cde.test;

import org.openqa.selenium.By;
import org.openqa.selenium.support.ui.Select;
import org.testng.Assert;
import org.testng.annotations.Test;
import org.openqa.selenium.Keys;
import java.util.List;
import org.openqa.selenium.WebElement;

public class ClassificationMgtTest extends NlmCdeBaseTest {
    private void searchNestedClassifiedCdes() {
        goToSearch();
        findElement(By.name("ftsearch")).sendKeys("classification.elements.elements.name:Epilepsy");
        findElement(By.id("search.submit")).click();    
    }
    
    private void gotoClassifMgt() {
        findElement(By.id("username_link")).click();
        findElement(By.linkText("Classifications")).click();          
    }
    
    private void checkNestedClassifs() {
        Assert.assertTrue(driver.findElement(By.cssSelector("[id='classification-Disease,Epilepsy'] .name")).getText().equals("Epilepsy"));
        Assert.assertTrue(driver.findElement(By.cssSelector("[id='classification-Disease,Epilepsy,Assessments and Examinations'] .name")).getText().equals("Assessments and Examinations"));
        Assert.assertTrue(driver.findElement(By.cssSelector("[id='classification-Disease,Epilepsy,Assessments and Examinations,Imaging Diagnostics'] .name")).getText().equals("Imaging Diagnostics"));    
    }
    
    private void deleteNestedClassifTree() {
        driver.findElement(By.cssSelector("[id='classification-Disease,Epilepsy'] [title=\"Remove\"]")).click();
        driver.findElement(By.cssSelector("[id='classification-Disease,Epilepsy'] [title=\"OK\"]")).click(); 
        hangon(0.3);
        Assert.assertTrue(textNotPresent("Epilepsy"));
        checkElementDoesNotExistByCSS("[id='classification-Disease,Epilepsy']");
        checkElementDoesNotExistByCSS("[id='classification-Disease,Epilepsy,Assessments and Examinations']");
        checkElementDoesNotExistByCSS("[id='classification-Disease,Epilepsy,Assessments and Examinations,Imaging Diagnostics']");
    }    
    

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
    public void removeClassificationMgt() {
        mustBeLoggedInAs("ninds", "pass");
        searchNestedClassifiedCdes();
        Assert.assertTrue(textPresent("NINDS (7)"));
        gotoClassifMgt();
        
        checkNestedClassifs();
        deleteNestedClassifTree();  
        searchNestedClassifiedCdes();
        hangon(3);
        Assert.assertTrue(textNotPresent("NINDS (7)"));
    }
    
    private void createClassificationName(String[] categories) {
        findElement(By.id("addClassification")).click(); 
        modalHere();
        for (int i=0; i<categories.length-1; i++) {
            findElement(By.cssSelector("[id='addClassification-"+categories[i]+"'] span.fake-link")).click();       
        }
        findElement(By.id("addNewCatName")).sendKeys(categories[categories.length-1]);   
        findElement(By.id("addClassificationButton")).click(); 
        modalGone();
        String selector = "";
        for (int i=0; i<categories.length; i++) {
            selector += categories[i];
            if (i<categories.length-1) selector += ",";
        }
        
        Assert.assertTrue(driver.findElement(By.cssSelector("[id='classification-"+selector+"'] .name")).getText().equals(categories[categories.length-1]));    
    }
    
    @Test
    public void addNestedClassification() {
        mustBeLoggedInAs("ninds", "pass");
        gotoClassifMgt();
        Assert.assertTrue(textPresent("Headache"));
        createClassificationName(new String[]{"Disease","Multiple Sclerosis","Assessments and Examinations","Imaging Diagnostics","MRI"});
        modalGone();
        createClassificationName(new String[]{"Disease","Multiple Sclerosis","Assessments and Examinations","Imaging Diagnostics","MRI","Contrast T1"});
        modalGone();
    }
    
    @Test
    public void link() {
        mustBeLoggedInAs("ninds", "pass");
        gotoClassifMgt();
        Assert.assertTrue(textPresent("Headache"));

    }
    
    @Test
    public void addDeleteClassificationMgt() {
        mustBeLoggedInAs("ninds", "pass");
        gotoClassifMgt();  
        createClassificationName(new String[]{"_a"});        
        createClassificationName(new String[]{"_a"});
        List<WebElement> linkList = driver.findElements(By.xpath("//span[text()=\"_a\"]"));
        Assert.assertTrue(linkList.size() == 1);
        createClassificationName(new String[]{"_a","_a_a"});        
        createClassificationName(new String[]{"_a","_a_a"});
        linkList = driver.findElements(By.xpath("//span[text()=\"_a_a\"]"));
        Assert.assertTrue(linkList.size() == 1);        
        createClassificationName(new String[]{"_a","_a_a","_a_a_a"});
        createClassificationName(new String[]{"_a","_a_b"});
        createClassificationName(new String[]{"_a","_a_c"});        
        driver.findElement(By.cssSelector("[id='classification-_a,_a_a'] [title=\"Remove\"]")).click();
        driver.findElement(By.cssSelector("[id='classification-_a,_a_a'] [title=\"OK\"]")).click();        
        checkElementDoesNotExistByCSS("[id='removeClassification-_a,_a_a']");
    }
    
    @Test
    public void renameClassification() {
        mustBeLoggedInAs("ninds", "pass");
        gotoClassifMgt(); 
        driver.findElement(By.xpath("//li[@id='classification-Disease,Spinal Muscular Atrophy'][//span[text()=\"Spinal Muscular Atrophy\"]]/span/a")).click();
        modalHere();
        findElement(By.id("renameClassifInput")).sendKeys(Keys.BACK_SPACE);
        findElement(By.id("renameClassifInput")).sendKeys("ia");
        findElement(By.xpath("//button[text()='Save']")).click();
        modalGone();
        findElement(By.id("classification-Disease,Spinal Muscular Atrophia,Assessments and Examinations"));
        findElement(By.id("classification-Disease,Spinal Muscular Atrophia,Assessments and Examinations,Imaging Diagnostics"));
        findElement(By.id("classification-Disease,Spinal Muscular Atrophia,Participant/Subject History and Family History,General Health History"));        
        findElement(By.xpath("//li[@id='classification-Disease,Spinal Muscular Atrophia,Assessments and Examinations']/a/span")).click();      
        hangon(1);
        Assert.assertTrue(textPresent("Spinal Muscular Atrophia (1"));
    }
}
