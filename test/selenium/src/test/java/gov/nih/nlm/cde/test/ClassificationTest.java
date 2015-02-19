package gov.nih.nlm.cde.test;

import static gov.nih.nlm.cde.test.NlmCdeBaseTest.driver;
import java.util.List;
import org.openqa.selenium.By;
import org.openqa.selenium.WebElement;
import org.testng.Assert;
import org.testng.annotations.Test;
import org.openqa.selenium.support.ui.Select;

public class ClassificationTest extends NlmCdeBaseTest {  
   public void addClassificationMethod(String[] categories) {
        findElement(By.linkText("Classification")).click();
        findElement(By.id("addClassification")).click();
        modalHere();

        new Select(findElement(By.id("selectClassificationOrg"))).selectByVisibleText(categories[0]);
        
        // Ensures that tree of classifications have finished loading.
        textPresent(categories[1]);

        for (int i = 1; i < categories.length - 1; i++) {
            findElement(By.cssSelector("[id='addClassification-" + categories[i] + "'] span.fake-link")).click();
        }
        findElement(By.cssSelector("[id='addClassification-" + categories[categories.length - 1] + "'] button")).click();
        closeAlert();
        findElement(By.cssSelector("#addClassificationModalFooter .done")).click();
        hangon(3);
        findElement(By.linkText("Classification")).click();
        String selector = "";
        for (int i = 1; i < categories.length; i++) {
            selector += categories[i];
            if (i < categories.length - 1) {
                selector += ",";
            }
        }
        Assert.assertTrue(driver.findElement(By.cssSelector("[id='classification-" + selector + "'] .name")).getText().equals(categories[categories.length - 1]));
    }
    
    @Test
    public void addClassification() {
        mustBeLoggedInAs("classificationMgtUser", "pass");
        goToCdeByName("Surgical Procedure Other Anatomic Site Performed Indicator");
        addClassificationMethod(new String[]{"NINDS","Disease","Myasthenia Gravis","Classification","Supplemental"});
        hangon(1);
        addClassificationMethod(new String[]{"NINDS","Domain","Treatment/Intervention Data","Therapies"});
        findElement(By.id("addClassification")).click(); 
        modalHere();
        List<WebElement> priorClassifs = driver.findElements(By.xpath("//div[ol]"));
        for (WebElement prior : priorClassifs) {
            if (prior.getText().contains("Myasthenia Gravis") && prior.getText().contains("Supplemental")) {
                prior.findElement(By.tagName("button")).click();
                textPresent("Classification Already Exists");
                closeAlert();
            }
        }
        findElement(By.xpath("//button[text() = 'Close']")).click();
        modalGone();
    }
    
    private void removeClassificationMethod(String[] categories) {
        findElement(By.linkText("Classification")).click();
        String selector = "";        
        for (int i=0; i<categories.length; i++) {
            selector += categories[i];
            if (i<categories.length-1) selector += ",";
        }
        Assert.assertTrue(driver.findElement(By.id("classification-"+selector)).getText().contains(categories[categories.length-1])); 
        deleteClassification("classification-"+selector);
        driver.navigate().refresh();
        findElement(By.linkText("Classification")).click();
        Assert.assertTrue(checkElementDoesNotExistByCSS("[id='classification-"+selector+"']"));
    }
    
    @Test
    public void deleteClassification() {
        mustBeLoggedInAs(classificationMgtUser_username, password);
        goToCdeByName("Spectroscopy geometry location not applicable indicator");
        findElement(By.linkText("Classification")).click();
        List<WebElement> linkList = driver.findElements(By.cssSelector("li[id$='Imaging Diagnostics']"));
        Assert.assertEquals(linkList.size(), 1);
        removeClassificationMethod(new String[]{"Domain","Assessments and Examinations","Imaging Diagnostics"});
        linkList = driver.findElements(By.cssSelector("li[id$='Imaging Diagnostics']"));
        Assert.assertEquals(linkList.size(), 0);
        linkList = driver.findElements(By.cssSelector("li[id$='Assessments and Examinations']"));
        Assert.assertTrue(linkList.size() == 1);
        
        removeClassificationMethod(new String[]{"Disease","Myasthenia Gravis"});
        Assert.assertTrue(textNotPresent("Myasthenia Gravis"));
    }    
    
    @Test
    public void classificationLink() {
        mustBeLoggedInAs(classificationMgtUser_username, password);
        goToCdeByName("Spectroscopy water signal removal filter text");
        findElement(By.linkText("Classification")).click();
        findElement(By.cssSelector("[id='classification-Domain,Assessments and Examinations,Imaging Diagnostics'] .name")).click();
        showSearchFilters();
        hangon(1);
        Assert.assertTrue(textPresent("Classifications"));
        Assert.assertTrue(textPresent("NINDS (10"));
        Assert.assertTrue(textPresent("Imaging Diagnostics"));
    }
    
    @Test
    public void checkDuplicatesClassification() {
        mustBeLoggedInAs(ninds_username, password);
        goToCdeByName("Product Problem Discover Performed Observation Outcome Identifier ISO21090.II.v1.0");
        textNotPresent( "Disease" ) ;
        addClassificationMethod(new String[]{"NINDS","Disease"});
        textPresent( "Disease" ) ;
        addClassificationMethod(new String[]{"NINDS","Disease"});
        List<WebElement> linkList = driver.findElements(By.cssSelector("li[id$='Disease']"));
        Assert.assertTrue(linkList.size() == 1);
    }
    
    // Feature is Temporarily Disabled
    //@Test
    public void classifyEntireSearch() {
        mustBeLoggedInAs(ninds_username, password);
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
