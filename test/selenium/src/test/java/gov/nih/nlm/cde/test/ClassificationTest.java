package gov.nih.nlm.cde.test;

import static gov.nih.nlm.cde.test.NlmCdeBaseTest.driver;
import java.util.List;
import java.util.ListIterator;
import java.util.logging.Level;
import java.util.logging.Logger;
import org.openqa.selenium.By;
import org.openqa.selenium.WebElement;
import org.testng.Assert;
import org.testng.annotations.Test;

public class ClassificationTest extends NlmCdeBaseTest {  
    private void addClassificationMethod(String[] categories){
        findElement(By.linkText("Classification")).click();
        findElement(By.id("addClassification")).click(); 
        modalHere();              
        findElement(By.id("classifySlectOrg-"+categories[0])).click();
        hangon(.5);
        for (int i=1; i<categories.length-1; i++) {
            findElement(By.cssSelector("[id='addClassification-"+categories[i]+"'] span.fake-link")).click();       
        }
        findElement(By.cssSelector("[id='addClassification-"+categories[categories.length-1]+"'] button")).click();         
        findElement(By.cssSelector(".alert .close")).click();
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
    
    @Test
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
    }
    
    @Test
    public void removeTopLevelClassification() {
        mustBeLoggedInAs(ninds_username, ninds_password);
        goToCdeByName("Lymph Node Procedure Negative Ind-2");
        findElement(By.linkText("Classification")).click();
        Assert.assertTrue( findElement( By.id( "CCR" ) ).getText().equals( "CCR" ) );
        Assert.assertTrue( checkElementDoesNotExistById( "NINDS" ) );
        addClassificationMethod(new String[]{"NINDS","Disease","Myasthenia Gravis","Assessments and Examinations","Imaging Diagnostics"});
        Assert.assertFalse( checkElementDoesNotExistById( "NINDS" ) );
        removeClassificationMethod(new String[]{"Disease"});
        Assert.assertTrue( checkElementDoesNotExistById( "NINDS" ) );
    }

}
