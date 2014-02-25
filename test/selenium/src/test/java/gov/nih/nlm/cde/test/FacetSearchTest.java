/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

package gov.nih.nlm.cde.test;

import static gov.nih.nlm.cde.test.NlmCdeBaseTest.driver;
import static gov.nih.nlm.cde.test.NlmCdeBaseTest.wait;
import java.util.List;
import org.openqa.selenium.By;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.support.ui.ExpectedConditions;
import org.testng.Assert;
import org.testng.annotations.Test;

/**
 *
 * @author ludetc
 */
public class FacetSearchTest extends NlmCdeBaseTest {
    @Test
    public void stewardFacets() {
        goHome();
        Assert.assertTrue(textPresent("CCR (8)"));
    }

    @Test
    public void statusFacets() {
        goHome();
        Assert.assertTrue(textPresent("candidate ("));
    }

    @Test
    public void facets() {
        goHome();
        findElement(By.name("ftsearch")).sendKeys("Treatment");
        findElement(By.id("search.submit")).click();
        Assert.assertTrue(textPresent("candidate (4)"));
        findElement(By.id("li-blank-candidate")).click();
        wait.until(ExpectedConditions.presenceOfElementLocated(By.partialLinkText("Disease or Disorder Response Surgical Procedure Documented Indicator")));
        hangon();
        List<WebElement> linkList = driver.findElements(By.cssSelector("div.accordion-heading"));
        Assert.assertEquals(linkList.size(), 4);
        findElement(By.id("li-blank-NHLBI")).click();
        // Seems like we should wait for something , like below, but below doesn't work and I can't come up with something to wait for ...
//            wait.until(ExpectedConditions.not(ExpectedConditions.presenceOfElementLocated(
//                    By.linkText("caBIG -- First Follow-up Visit Date"))));
        hangon();
        linkList = driver.findElements(By.cssSelector("div.accordion-heading"));
        Assert.assertEquals(linkList.size(), 2);
        findElement(By.id("li-checked-candidate")).click();
        wait.until(ExpectedConditions.presenceOfElementLocated(
                By.partialLinkText("Hydroxychloroquine Sulfate Administered Indicator")));
        hangon();
        linkList = driver.findElements(By.cssSelector("div.accordion-heading"));
        Assert.assertEquals(linkList.size(), 7);
        findElement(By.id("li-checked-NHLBI")).click();
        wait.until(ExpectedConditions.presenceOfElementLocated(By.linkText("6")));
    }
    
    @Test
    public void facetPagination() {
        goHome();
        findElement(By.id("li-blank-CTEP")).click();
        // next line should make it wait.
        findElement(By.cssSelector("i.fa-check-square-o"));
        for (WebElement elt : driver.findElements(By.cssSelector("a.accordion-toggle"))) {
            Assert.assertTrue(elt.getText().startsWith("CTEP"));
        }
        findElement(By.linkText("Next")).click();
        hangon();
        findElement(By.cssSelector("i.fa-check-square-o"));
        for (WebElement elt : driver.findElements(By.cssSelector("a.accordion-toggle"))) {
            Assert.assertTrue(elt.getText().startsWith("CTEP"));
        }
        findElement(By.name("ftsearch")).sendKeys("Kinetics");
        findElement(By.id("search.submit")).click();
        Assert.assertTrue(textPresent("DCE-MRI Kinetics T1 Mapping Quality Type"));

    }

    
    @Test
    public void classificationFilters() {
        goHome();
        findElement(By.name("ftsearch")).sendKeys("Toxicity");
        findElement(By.id("search.submit")).click();
        Assert.assertTrue(textPresent("CTEP (9)"));
        findElement(By.id("li-blank-CTEP")).click();
        Assert.assertTrue(textPresent("DISEASE (14)"));

        hangon();
        List <WebElement> linkList = driver.findElements(By.cssSelector("div.accordion-heading"));
        Assert.assertEquals(linkList.size(), 9);

        // Check that CTEP classification with 0 items does not show
        Assert.assertTrue(driver.findElement(By.cssSelector("BODY")).getText().indexOf("ABTC") < 0);
        
        findElement(By.id("li-blank-DISEASE")).click();
        Assert.assertTrue(textPresent("Lymphoma (1)"));
        findElement(By.id("li-blank-Lymphoma")).click();
        
        hangon();
        linkList = driver.findElements(By.cssSelector("div.accordion-heading"));
        Assert.assertEquals(linkList.size(), 1);
        
        // Now test unclicking everything
        findElement(By.id("li-checked-Lymphoma")).click();
        hangon();
        linkList = driver.findElements(By.cssSelector("div.accordion-heading"));
        Assert.assertEquals(linkList.size(), 9);
        
        findElement(By.id("li-blank-DISEASE")).click();
        Assert.assertTrue(textPresent("Lymphoma (1)"));
        findElement(By.id("li-blank-Lymphoma")).click();
        
        hangon();
        linkList = driver.findElements(By.cssSelector("div.accordion-heading"));
        Assert.assertEquals(linkList.size(), 1);
        
        findElement(By.id("li-checked-CTEP")).click();
        hangon();
        linkList = driver.findElements(By.cssSelector("div.accordion-heading"));
        Assert.assertEquals(linkList.size(), 10);

    }
 
}
