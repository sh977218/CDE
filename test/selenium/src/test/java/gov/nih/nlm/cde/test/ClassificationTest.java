package gov.nih.nlm.cde.test;

import static gov.nih.nlm.cde.test.NlmCdeBaseTest.driver;
import java.util.List;
import org.openqa.selenium.By;
import org.openqa.selenium.WebElement;
import org.testng.Assert;
import org.testng.annotations.Test;
import org.openqa.selenium.support.ui.Select;

public class ClassificationTest extends NlmCdeBaseTest {
    
    /*
    
    @Test
    public void removeClassification() {
        mustBeLoggedInAs(ctepCurator_username, ctepCurator_password);
        goToCdeByName("Cigarette");
        findElement(By.linkText("Classification")).click();
        String toRemove = findElement(By.cssSelector("[data-id=classification-3-0]")).getText();
        findElement(By.id("removeClassification-3-0")).click();
        findElement(By.id("confirmRemoveClassification-3-0")).click();
        Assert.assertTrue(textPresent("Classification Removed"));
        findElement(By.linkText("Classification")).click();
        Assert.assertTrue(driver.findElement(By.cssSelector("BODY")).getText().contains(toRemove));
    }
    
    @Test // TODO - test link on nested classifications
    public void classificationLink() {
        goToCdeByName("Cigarette Average");
        findElement(By.linkText("Classification")).click();
        findElement(By.linkText("Iloprost 12079")).click();
        Assert.assertTrue(textPresent("Iloprost 12079"));
        Assert.assertTrue(textPresent("Iloprost Trial"));  
        Assert.assertTrue(textPresent("Patient Gender Category"));
        Assert.assertTrue(textPresent("Patient Ethnic Group Category"));
        Assert.assertTrue(textPresent("Cigarette Average Daily Pack Use Count"));
        List <WebElement> linkList = driver.findElements(By.cssSelector("div.panel-default"));
        Assert.assertEquals(linkList.size(), 3);
    }    
*/
    
    private void addClassificationMethod(String[] categories){
        findElement(By.linkText("Classification")).click();
        findElement(By.id("addClassification")).click(); 
        modalHere();              
        findElement(By.id("classifySlectOrg-"+categories[0])).click();       
        for (int i=1; i<categories.length-1; i++) {
            findElement(By.cssSelector("[id='addClassification-"+categories[i]+"'] span.fake-link")).click();       
        } 
        findElement(By.cssSelector("[id='addClassification-"+categories[categories.length-1]+"'] button")).click(); 
        findElement(By.cssSelector("#addClassificationModalFooter .done")).click();
        hangon(1);
        findElement(By.linkText("Classification")).click();
        String selector = "";        
        for (int i=1; i<categories.length; i++) {
            selector += categories[i];
            if (i<categories.length-1) selector += ",";
        }
        Assert.assertTrue(driver.findElement(By.cssSelector("[id='classification-"+selector+"'] .name")).getText().equals(categories[categories.length-1]));      
    }
    
    //@Test
    public void addClassification() {
        mustBeLoggedInAs("classificationMgtUser", "pass");
        goToCdeByName("Surgical Procedure Other Anatomic Site Performed Indicator");
        addClassificationMethod(new String[]{"NINDS","Disease","Myasthenia Gravis","Assessments and Examinations","Imaging Diagnostics"});
        addClassificationMethod(new String[]{"caBIG","Clinical Trial Mgmt Systems","Arizona Cancer Center"});
        addClassificationMethod(new String[]{"NINDS","Disease","Duchenne Muscular Dystrophy/Becker Muscular Dystrophy","Treatment/Intervention Data","Therapies"});
    }
    
    private void removeClassificationMethod(String[] categories) {
        findElement(By.linkText("Classification")).click();
        String selector = "";        
        for (int i=0; i<categories.length; i++) {
            selector += categories[i];
            if (i<categories.length-1) selector += ",";
        }
        Assert.assertTrue(driver.findElement(By.cssSelector("[id='classification-"+selector+"'] .name")).getText().equals(categories[categories.length-1])); 
        findElement(By.cssSelector("[id='classification-"+selector+"'] [title='Remove']")).click(); 
        findElement(By.cssSelector("[id='classification-"+selector+"'] .fa-check")).click(); 
        driver.navigate().refresh();
        findElement(By.linkText("Classification")).click();
        Assert.assertTrue(checkElementDoesNotExistByCSS("[id='classification-"+selector+"'] .name"));
    }
    
    @Test
    public void deleteClassification() {
        mustBeLoggedInAs("classificationMgtUser", "pass");
        goToCdeByName("Spectroscopy geometry location not applicable indicator");
        List<WebElement> linkList = driver.findElements(By.cssSelector("[id$='Imaging Diagnostics']"));
        Assert.assertTrue(linkList.size() == 3);        
        removeClassificationMethod(new String[]{"Disease","Myasthenia Gravis","Assessments and Examinations","Imaging Diagnostics"});
        linkList = driver.findElements(By.cssSelector("[id$='Imaging Diagnostics']"));
        Assert.assertTrue(linkList.size() == 2);
        linkList = driver.findElements(By.cssSelector("[id$='Assessments and Examinations']"));
        Assert.assertTrue(linkList.size() == 3);
        
        removeClassificationMethod(new String[]{"Disease","Myasthenia Gravis"});
        Assert.assertTrue(textNotPresent("Myasthenia Gravis"));
        linkList = driver.findElements(By.cssSelector("[id$='Assessments and Examinations']"));
        Assert.assertTrue(linkList.size() == 2);        
    }    
}
