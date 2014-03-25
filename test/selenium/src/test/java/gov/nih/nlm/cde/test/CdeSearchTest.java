package gov.nih.nlm.cde.test;

import java.util.List;
import org.openqa.selenium.By;
import org.openqa.selenium.WebElement;
import org.testng.Assert;
import org.testng.annotations.Test;

/**
 *
 * @author ludetc
 */
public class CdeSearchTest extends NlmCdeBaseTest {
    
    @Test
    public void cdeFullDetail() {
        goToCdeByName("Genotype Therapy Basis Mutation");
        Assert.assertTrue(textPresent("Genotype Therapy Basis Mutation Analysis Indicator"));
        Assert.assertTrue(textPresent("3157849v1"));
        Assert.assertTrue(textPresent("Text descriptor to indicate whether "
                + "genotype directed therapy was based on mutation testing"));
        Assert.assertTrue(textPresent("Qualified"));
        findElement(By.linkText("Permissible Values")).click();
        Assert.assertTrue(textPresent("Unknown"));
        findElement(By.linkText("Concepts")).click();
        Assert.assertTrue(textPresent("Mutation Analysis"));
        Assert.assertTrue(textPresent("C18302"));
        findElement(By.linkText("History")).click();
        Assert.assertTrue(textPresent("This Data Element has no history"));
        findElement(By.linkText("Classification")).click();
        WebElement csDl = findElement(By.id("repeatCs"));
        List<WebElement> csElements = csDl.findElements(By.xpath("//div/dd/div"));
        Assert.assertEquals(csElements.size(), 4);
        Assert.assertEquals(csElements.get(0).getText(), "GO Trial");
        Assert.assertEquals(csElements.get(1).getText(), "GO New CDEs");
        Assert.assertEquals(csElements.get(2).getText(), "C3D");
        Assert.assertEquals(csElements.get(3).getText(), "caBIG");
    } 
    
    @Test
    public void unitOfMeasure() {
        goToCdeByName("Laboratory Procedure Blood");
        Assert.assertTrue(textPresent("mg/dL"));
    }

    @Test
    public void basicPagination() {
        goHome();
        WebElement pagElt = findElement(By.cssSelector("ul.pagination"));
        findElement(By.linkText("10"));
        List<WebElement> linkList = pagElt.findElements(By.cssSelector("a"));
        Assert.assertEquals(linkList.size(), 12);                
    }
    
    @Test
    public void viewIncrement() {
        goToCdeByName("Tissue Donor Genetic Testing Other Disease or Disorder Specify");
        // wait for text to be here.
        Assert.assertTrue(textPresent("Someone who gives blood"));
        // do it twice to get at least one view
        goToCdeByName("Tissue Donor Genetic Testing Other Disease or Disorder Specify");
        Assert.assertTrue(textPresent("Someone who gives blood"));
        int nbOfViews = Integer.valueOf(findElement(By.id("dd_views")).getText());
        goToCdeByName("Tissue Donor Genetic Testing Other Disease or Disorder Specify");
        Assert.assertTrue(textPresent("Someone who gives blood"));
        int newNbOfViews = Integer.valueOf(findElement(By.id("dd_views")).getText());
        Assert.assertEquals(newNbOfViews, nbOfViews + 1);
    }
        
    @Test
    public void relatedConcepts() {
        goToCdeByName("Patient Visual Change Chief Complaint Indicator");
        findElement(By.linkText("Concepts")).click();
        findElement(By.linkText("Change")).click();
        hangon(2);
        Assert.assertTrue(textPresent("Specimen Inflammation Change Type"));
    }
    
    @Test 
    public void phraseSearch() {
        goHome();
        findElement(By.name("ftsearch")).sendKeys("Biomarker Gene");
        findElement(By.id("search.submit")).click();
        Assert.assertTrue(textPresent("Biomarker Gene"));
        List<WebElement> linkList = driver.findElements(By.cssSelector("div.panel-default"));
        Assert.assertTrue(linkList.size() > 10);

        findElement(By.name("ftsearch")).clear();
        findElement(By.name("ftsearch")).sendKeys("\"Biomarker Gene\"");
        findElement(By.id("search.submit")).click();
        Assert.assertTrue(textPresent("caBIG (1)"));
        
        Assert.assertTrue(textPresent("Biomarker Gene"));
        linkList = driver.findElements(By.cssSelector("div.panel-default"));
        Assert.assertEquals(linkList.size(), 1);
    }
    
    @Test
    public void starSearch() {
        goHome();
        findElement(By.name("ftsearch")).sendKeys("ISO2109");
        findElement(By.id("search.submit")).click();
        Assert.assertTrue(textPresent("No Results"));
        
        goHome();
        findElement(By.name("ftsearch")).sendKeys("ISO2109*");
        findElement(By.id("search.submit")).click();
        List<WebElement> linkList = driver.findElements(By.cssSelector("div.panel-default"));
        Assert.assertTrue(linkList.size() > 10);
        Assert.assertTrue(textPresent("ISO21090.ST"));
  
    }
    
}
