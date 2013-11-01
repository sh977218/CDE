package gov.nih.nlm.cde.test;

import java.util.List;
import org.openqa.selenium.By;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.support.ui.Select;
import org.testng.Assert;
import org.testng.annotations.Test;

/**
 *
 * @author ludetc
 */
public class CdeSearchTest extends NlmCdeBaseTest {
    
    @Test
    public void cdeFullDetail() {
        driver.get(baseUrl + "/");
        goToCdeByName("enotype Therapy Basis Mutation");
        Assert.assertTrue(textPresent("Genotype Therapy Basis Mutation Analysis Indicator"));
        Assert.assertTrue(textPresent("3157849v1"));
        Assert.assertTrue(textPresent("Text descriptor to indicate whether "
                + "genotype directed therapy was based on mutation testing"));
        Assert.assertTrue(textPresent("Qualified"));
        findElement(By.linkText("Permissible Values")).click();
        Assert.assertTrue(textPresent("Unknown"));
        findElement(By.linkText("DE Concepts")).click();
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
    public void searchByClassification() {
        driver.get(baseUrl + "/");
        new Select(driver.findElement(By.name("conceptSystem"))).selectByVisibleText("PhenX");
        List<WebElement> webElts = findElement(By.xpath("//accordion/div")).findElements(By.cssSelector("div.accordion-group"));
        Assert.assertEquals(webElts.size(), 2);
        Assert.assertEquals(webElts.get(0).getText(), "caBIG -- Immunology Gonorrhea Assay Laboratory Finding Result");
        Assert.assertEquals(webElts.get(1).getText(), "caBIG -- Alcohol Retail Environment Assessment Description Text");
    }

    @Test
    public void basicPagination() {
        driver.get(baseUrl + "/");
        WebElement pagElt = findElement(By.cssSelector("div.pagination"));
        findElement(By.linkText("10"));
        List<WebElement> linkList = pagElt.findElements(By.cssSelector("a"));
        Assert.assertEquals(linkList.size(), 12);                
    }
    
    @Test
    public void filterByStatus() throws InterruptedException {
        driver.get(baseUrl + "/");
        new Select(driver.findElement(By.name("registrationStatus"))).selectByVisibleText("Candidate");
        findElement(By.linkText("caBIG -- Intervention Trial Study Protocol Document Classification Code StudyClassificationCategory"));
        WebElement pagElt = findElement(By.cssSelector("div.pagination"));
        List<WebElement> linkList = pagElt.findElements(By.cssSelector("a"));
        Assert.assertEquals(linkList.size(), 7);        
    }
    
    @Test
    public void filterByOrg() {
        driver.get(baseUrl + "/");
        new Select(driver.findElement(By.name("stewardOrg.name"))).selectByVisibleText("EDRN");
        List<WebElement> webElts = findElement(By.xpath("//accordion/div")).findElements(By.cssSelector("div.accordion-group"));
        Assert.assertEquals(webElts.size(), 1);
        Assert.assertEquals(webElts.get(0).getText(), "EDRN -- Specimen Process Time Value");
    }
    
}
