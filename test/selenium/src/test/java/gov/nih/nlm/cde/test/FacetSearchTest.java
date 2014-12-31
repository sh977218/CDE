package gov.nih.nlm.cde.test;

import static gov.nih.nlm.cde.test.NlmCdeBaseTest.driver;
import static gov.nih.nlm.cde.test.NlmCdeBaseTest.wait;
import java.util.List;
import org.openqa.selenium.By;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.support.ui.ExpectedConditions;
import org.openqa.selenium.support.ui.Select;
import org.testng.Assert;
import org.testng.annotations.Test;

public class FacetSearchTest extends NlmCdeBaseTest {

    public void clickIfDisplayed(String id) {
        List<WebElement> elts = driver.findElements(By.id(id));
        for (int i = 0; i < elts.size(); i++) {
            if (elts.get(i).isDisplayed()) {
                elts.get(i).click();
                i = elts.size();
            }
        }
    }
    
    @Test
    public void stewardFacets() {
        goToCdeSearch();
        textPresent("GRDR (75)");
    }

    @Test
    public void statusFacets() {
        goToCdeSearch();
        textPresent("Qualified (94");
        findElement(By.id("li-blank-caBIG")).click();
        findElement(By.cssSelector("i.fa-check-square-o"));
        textPresent("Qualified (1");
    }

    @Test
    public void deepFacets() {
        goToCdeSearch();
        findElement(By.id("li-blank-NINDS")).click();
        findElement(By.id("li-blank-Disease")).click();
        findElement(By.id("li-blank-Traumatic Brain Injury")).click();
        findElement(By.id("li-blank-Acute Hospitalized")).click();
        hangon(1);
        clickIfDisplayed("li-blank-Classification");
        findElement(By.id("li-blank-Basic")).click();
        textPresent("88 results for");
        findElement(By.id("li-checked-Acute Hospitalized")).click();
        textPresent("117");
        textPresent("Mild TBI (117");
        textPresent("Epidemiology (11");
        findElement(By.id("li-checked-Disease")).click();
    }
    
    @Test
    public void facets() {
        mustBeLoggedInAs(cabigAdmin_username, password);
        goToCdeSearch();
        findElement(By.name("ftsearch")).sendKeys("Study");
        findElement(By.id("search.submit")).click();
        textPresent("Candidate (10)");
        findElement(By.id("li-checked-Qualified")).click();
        hangon(1);
        findElement(By.id("li-checked-Standard")).click();
        hangon(1);
        try {
            findElement(By.id("li-checked-Preferred Standard")).click();
            hangon(1);
        } catch (Exception e) {}

        findElement(By.id("li-blank-Candidate")).click();
        wait.until(ExpectedConditions.presenceOfElementLocated(By.partialLinkText("Intervention Trial Study Protocol Document Classification ")));

        textPresent("10 results ");
        findElement(By.id("li-blank-caBIG")).click();

        textPresent("9 results");

        findElement(By.id("li-checked-Candidate")).click();

        wait.until(ExpectedConditions.presenceOfElementLocated(
                By.partialLinkText("Work Or Study Difficulty With Homework ")));
        hangon(1);
        wait.until(ExpectedConditions.presenceOfElementLocated(By.linkText("3")));
        scrollToTop();
        findElement(By.id("li-checked-caBIG")).click();
        Assert.assertTrue(textPresent("Electrophysiology study type"));
    }
    
    @Test
    public void facetPagination() {
        goToCdeSearch();
        findElement(By.id("li-blank-CTEP")).click();
        // next line should make it wait.
        findElement(By.cssSelector("i.fa-check-square-o"));
        hangon(2);
        findElement(By.linkText("Next")).click();
        Assert.assertTrue(textPresent("OPEN to Rave Standard "));
        findElement(By.cssSelector("i.fa-check-square-o"));
        
        scrollToTop();
        
        findElement(By.id("resetSearch")).click();
        Assert.assertTrue(textPresent("Qualified (94"));
        findElement(By.name("ftsearch")).sendKeys("Immunology");
        findElement(By.cssSelector("i.fa-search")).click();
        Assert.assertTrue(textPresent("Immunology Gonorrhea Assay Laboratory Finding Result"));
    }

    @Test
    public void classificationFilters() {
        goToCdeSearch();
        findElement(By.name("ftsearch")).sendKeys("Image");
        findElement(By.id("search.submit")).click();
        textPresent("caBIG (8)");
        findElement(By.id("li-blank-caBIG")).click();
        textPresent("Generic Image");

        textPresent("8 results for");
        List <WebElement> linkList = driver.findElements(By.cssSelector("div.panel-default"));
        Assert.assertEquals(linkList.size(), 8);

        // Check that CTEP classification with 0 items does not show
        Assert.assertTrue(!driver.findElement(By.cssSelector("BODY")).getText().contains("Radiograph Evidence Type"));
        
        findElement(By.id("li-blank-Generic Image")).click();
        textPresent("genericimage (2)");
        findElement(By.id("li-blank-gov.nih.nci.ivi.genericimage")).click();
        textPresent("2 results for");
        
        linkList = driver.findElements(By.cssSelector("div.panel-default"));
        Assert.assertEquals(linkList.size(), 2);
        
        // Now test unclicking everything
        findElement(By.id("li-checked-Generic Image")).click();
        textPresent("8 results for");
        linkList = driver.findElements(By.cssSelector("div.panel-default"));
        Assert.assertEquals(linkList.size(), 8);
        
        textPresent("Generic Image (2)");
        findElement(By.id("li-blank-Generic Image")).click();
        
        textPresent("2 results for");
        linkList = driver.findElements(By.cssSelector("div.panel-default"));
        Assert.assertEquals(linkList.size(), 2);
        
        findElement(By.id("li-checked-caBIG")).click();
        textPresent("92 results for");

    
    }
    
    @Test
    public void preferredStandardFacet() {
        mustBeLoggedInAs(nlm_username, nlm_password);
        goToCdeByName("Noncompliant Reason Text");
        findElement(By.id("editStatus")).click();
        modalHere();
        new Select(driver.findElement(By.name("registrationStatus"))).selectByVisibleText("Preferred Standard");
        textPresent("Standard elements cannot be edited by their stewards");
        modalHere();
        findElement(By.id("saveRegStatus")).click();
        hangon(2);
        goToCdeSearch();  
        textPresent("Preferred Standard");
        findElement(By.id("li-checked-Preferred Standard")).click();
        textNotPresent("Noncompliant Reason Text");
    }
    
}
