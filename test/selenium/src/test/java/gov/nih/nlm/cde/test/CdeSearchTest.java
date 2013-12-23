package gov.nih.nlm.cde.test;

import java.util.List;
import org.openqa.selenium.By;
import org.openqa.selenium.NoSuchElementException;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.support.ui.ExpectedConditions;
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
    public void stewardFacets() {
        driver.get(baseUrl + "/");
        Assert.assertTrue(textPresent("ccr (8)"));
    }

    @Test
    public void statusFacets() {
        driver.get(baseUrl + "/");
        Assert.assertTrue(textPresent("candidate ("));
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
    public void facets() {
        driver.get(baseUrl + "/");
        findElement(By.name("ftsearch")).sendKeys("Treatment");
        findElement(By.id("search.submit")).click();
        // expect 4 candidate records
        Assert.assertTrue(textPresent("candidate (4)"));
        findElement(By.id("li-blank-candidate")).click();
        wait.until(ExpectedConditions.presenceOfElementLocated(By.linkText("NHLBI -- Disease or Disorder Response Surgical Procedure Documented Indicator")));
        List<WebElement> linkList = driver.findElements(By.cssSelector("div.accordion-heading"));
        Assert.assertEquals(linkList.size(), 4);
        findElement(By.id("li-blank-nhlbi")).click();
        // Seems like we should wait for something , like below, but below doesn't work and I can't come up with something to wait for ...
//            wait.until(ExpectedConditions.not(ExpectedConditions.presenceOfElementLocated(
//                    By.linkText("caBIG -- First Follow-up Visit Date"))));
        linkList = driver.findElements(By.cssSelector("div.accordion-heading"));
        Assert.assertEquals(linkList.size(), 2);
        findElement(By.id("li-checked-candidate")).click();
        wait.until(ExpectedConditions.presenceOfElementLocated(
                By.linkText("NHLBI -- Hydroxychloroquine Sulfate Administered Indicator")));
        linkList = driver.findElements(By.cssSelector("div.accordion-heading"));
        Assert.assertEquals(linkList.size(), 7);
        findElement(By.id("li-checked-nhlbi")).click();
        wait.until(ExpectedConditions.presenceOfElementLocated(By.linkText("6")));
    }
    
    
}
