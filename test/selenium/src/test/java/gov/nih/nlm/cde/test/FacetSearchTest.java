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

    private void clickIfDisplayed(String id) {
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
        textPresent("1174 results for");
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
        hangon(1);
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
        findElement(By.id("li-blank-Preferred Standard")).click();
        textPresent("Noncompliant Reason Text");
    }
    
    @Test
    public void ownerAndAdminCanSeeLowStatus() {
        mustBeLoggedInAs(ctepCurator_username, password);
        String cdeName = "Low Status Cde";
        new CdeCreateTest().createBasicCde(cdeName, "Low Stat Definition", "0.1", "CTEP", "DISEASE", "Lung");
        goToCdeSearch();
        findElement(By.id("li-blank-Incomplete")).click();
        textPresent(cdeName);
        
        mustBeLoggedInAs(cabigAdmin_username, password);
        goToCdeSearch();
        hangon(1);
        if (textPresentTrueFalse("Incomplete (")) {
            findElement(By.id("li-blank-Incomplete")).click();
            textNotPresent(cdeName);
        }
        
        mustBeLoggedInAs(nlm_username, nlm_password);
        goToCdeSearch();
        findElement(By.id("li-blank-Incomplete")).click();
        textPresent(cdeName);

        mustBeLoggedInAs(ctepCurator_username, password);
        goToCdeByName(cdeName);
        findElement(By.id("editStatus")).click();
        modalHere();
        new Select(driver.findElement(By.name("registrationStatus"))).selectByVisibleText("Candidate");
        findElement(By.id("saveRegStatus")).click();
        hangon(3);

        goToCdeSearch();
        findElement(By.id("li-blank-Candidate")).click();
        textPresent(cdeName);
        
        mustBeLoggedInAs(cabigAdmin_username, password);
        goToCdeSearch();
        hangon(1);
        if (textPresentTrueFalse("Candidate (")) {
            findElement(By.id("li-blank-Candidate")).click();
            textNotPresent(cdeName);
        }
        
        mustBeLoggedInAs(nlm_username, nlm_password);
        goToCdeSearch();
        findElement(By.id("ftsearch-input")).sendKeys(cdeName);
        findElement(By.cssSelector("i.fa-search")).click();
        hangon(1);
        findElement(By.id("li-blank-Candidate")).click();
        textPresent(cdeName);
        
    }
    
    @Test
    public void infoBarClassification() {
        goToCdeSearch();
        findElement(By.id("resetSearch")).click();
        hangon(.5);
        findElement(By.id("li-blank-NINDS")).click();
        findElement(By.id("li-blank-Disease")).click();
        findElement(By.id("li-blank-Amyotrophic Lateral Sclerosis")).click();
        clickIfDisplayed("li-blank-Classification");
        clickIfDisplayed("li-blank-Core");
        textPresent( "NINDS : Disease : Amyotrophic Lateral Sclerosis : Classification : Core" );
        findElement(By.id("resetSearch")).click();
        textPresent( "All Classifications" );
    }
    
    @Test
    public void infoBarStatus() {
        goToCdeSearch();
        findElement(By.id("resetSearch")).click();
        hangon(2);
        findElement(By.id("li-blank-Qualified")).click();
        textPresent("| Qualified");
        findElement(By.id("li-blank-Recorded")).click();
        textPresent( "Qualified, Recorded" );
        scrollToTop();
        findElement(By.id("resetSearch")).click();
        textPresent( "All Status" );
    }
    
        
    @Test
    public void infoBarTerms() {
        goToCdeSearch();
        findElement(By.id("resetSearch")).click();
        findElement(By.name("ftsearch")).sendKeys("blah blah blah");
        findElement(By.cssSelector("i.fa-search")).click();
        hangon(.5);
        scrollToTop();
        textPresent( "blah blah blah" );
        findElement(By.id("resetSearch")).click();
        textPresent( "All Terms" );
    }
    
    @Test
    public void hoverOverClassifications() {
        goToCdeSearch();
        hoverOverElement(findElement(By.linkText("CDEs")));
        textNotPresent("Albert Einstein Cancer Center");
        hoverOverElement(findElement(By.id("classifications-text-AECC")));
        textPresent("Albert Einstein Cancer Center");
        hoverOverElement(findElement(By.id("classifications-text-caBIG")));
        textNotPresent("Albert Einstein Cancer Center");
    }
    
    @Test
    public void lowStatusFilter() {
        mustBeLoggedInAs(acrin_username, password);
        goToCdeSearch();
        textPresent("ACRIN (3)");
        logout();
        goToCdeSearch();
        textNotPresent("ACRIN (3");
    }
}
