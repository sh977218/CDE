package gov.nih.nlm.cde.test;

import static gov.nih.nlm.cde.test.NlmCdeBaseTest.driver;
import java.util.List;
import org.openqa.selenium.By;
import org.openqa.selenium.WebElement;
import org.testng.Assert;
import org.testng.annotations.Test;

public class ClassificationTest extends NlmCdeBaseTest {  

    
    /*@Test
    public void addClassification() {
        mustBeLoggedInAs("classificationMgtUser", "pass");
        goToCdeByName("Surgical Procedure Other Anatomic Site Performed Indicator");
        addClassificationMethod(new String[]{"NINDS","Disease","Myasthenia Gravis","Assessments and Examinations","Imaging Diagnostics"});
        hangon(1);
        addClassificationMethod(new String[]{"NINDS","Disease","Duchenne Muscular Dystrophy/Becker Muscular Dystrophy","Treatment/Intervention Data","Therapies"});
        findElement(By.id("addClassification")).click(); 
        modalHere();
        List<WebElement> priorClassifs = driver.findElements(By.xpath("//div[ol]"));
        for (WebElement prior : priorClassifs) {
            if (prior.getText().contains("Duchenne Muscular") && prior.getText().contains("Therapies")) {
                prior.findElement(By.tagName("button")).click();
                Assert.assertTrue(textPresent("Classification Already Exists"));
                closeAlert();
            }
        }
        findElement(By.xpath("//button[text() = 'Done']")).click();
        modalGone();
    }
    
    private void removeClassificationMethod(String[] categories) {
        findElement(By.linkText("Classification")).click();
        String selector = "";        
        for (int i=0; i<categories.length; i++) {
            selector += categories[i];
            if (i<categories.length-1) selector += ",";
        }
        Assert.assertTrue(driver.findElement(By.id("classification-"+selector)).getText().contains("> "+categories[categories.length-1])); 
        findElement(By.cssSelector("[id='classification-"+selector+"'] [title='Remove']")).click(); 
        findElement(By.cssSelector("[id='classification-"+selector+"'] .fa-check")).click();
        Assert.assertTrue(textPresent("Classification Deleted"));
        driver.navigate().refresh();
        findElement(By.linkText("Classification")).click();
        Assert.assertTrue(checkElementDoesNotExistByCSS("[id='classification-"+selector+"']"));
    }
    
    @Test
    public void deleteClassification() {
        mustBeLoggedInAs("classificationMgtUser", "pass");
        goToCdeByName("Spectroscopy geometry location not applicable indicator");
        findElement(By.linkText("Classification")).click();
        List<WebElement> linkList = driver.findElements(By.cssSelector("li[id$='Imaging Diagnostics']"));
        Assert.assertTrue(linkList.size() == 3);
        removeClassificationMethod(new String[]{"Disease","Myasthenia Gravis","Assessments and Examinations","Imaging Diagnostics"});
        linkList = driver.findElements(By.cssSelector("li[id$='Imaging Diagnostics']"));
        Assert.assertTrue(linkList.size() == 2);
        linkList = driver.findElements(By.cssSelector("li[id$='Assessments and Examinations']"));
        Assert.assertTrue(linkList.size() == 3);
        
        removeClassificationMethod(new String[]{"Disease","Myasthenia Gravis"});
        Assert.assertTrue(textNotPresent("Myasthenia Gravis"));
        linkList = driver.findElements(By.cssSelector("li[id$='Assessments and Examinations']"));
        Assert.assertTrue(linkList.size() == 2);
    }    
    
    @Test
    public void classificationLink() {
        mustBeLoggedInAs("classificationMgtUser", "pass");
        goToCdeByName("Spectroscopy geometry location not applicable indicator");
        findElement(By.linkText("Classification")).click();
        findElement(By.cssSelector("[id='classification-Disease,Spinal Muscular Atrophy,Assessments and Examinations,Imaging Diagnostics'] .name")).click();
        hangon(1);
        Assert.assertTrue(textPresent("Classifications"));
        Assert.assertTrue(textPresent("NINDS (7)"));
        Assert.assertTrue(textPresent("Imaging Diagnostics (7)"));
        Assert.assertTrue(textPresent("Spinal Muscular Atrophy (7)"));
        List<WebElement> linkList = driver.findElements(By.xpath("//small[text()=' Disease (7)']"));
        Assert.assertEquals(linkList.size(), 1);
    }
    
    @Test
    public void checkDuplicatesClassification() {
        mustBeLoggedInAs(ninds_username, ninds_password);
        goToCdeByName("Product Problem Discover Performed Observation Outcome Identifier ISO21090.II.v1.0");
        Assert.assertTrue( textNotPresent( "Disease" ) );
        addClassificationMethod(new String[]{"NINDS","Disease"});
        Assert.assertTrue( textPresent( "Disease" ) );
        addClassificationMethod(new String[]{"NINDS","Disease"});
        List<WebElement> linkList = driver.findElements(By.cssSelector("li[id$='Disease']"));
        Assert.assertTrue(linkList.size() == 1);
    }*/
    
    @Test
    public void classifyEntireSearch() {
        mustBeLoggedInAs(ninds_username, ninds_password);
        goToCdeSearch();
        findElement(By.id("li-blank-AECC")).click();
        textPresent("NCI Standard Template CDEs (7)");
        findElement(By.id("classifyAll")).click();
        findElement(By.xpath("//span[text()='Population']")).click();
        findElement(By.xpath("//div[@id='addClassification-Adult']//button")).click();
        textPresent("Search result classified");
        goToCdeByName("Noncompliant Reason Text");
        findElement(By.linkText("Classification")).click();
        textPresent("NINDS");
        textPresent("Population");
        textPresent("Adult");
        goToCdeByName("Adverse Event Ongoing Event Indicator");
        findElement(By.linkText("Classification")).click();
        textPresent("NINDS");
        textPresent("Population");
        textPresent("Adult");        
    }    

}
