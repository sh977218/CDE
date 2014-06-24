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
    @Test
    public void stewardFacets() {
        goToSearch();
        Assert.assertTrue(textPresent("GRDR (75)"));
    }

    @Test
    public void statusFacets() {
        goToSearch();
        Assert.assertTrue(textPresent("Qualified (4"));
        findElement(By.id("li-blank-caBIG")).click();
        findElement(By.cssSelector("i.fa-check-square-o"));
        Assert.assertTrue(textPresent("Qualified (1"));
    }

    @Test
    public void deepFacets() {
        goToSearch();
        findElement(By.id("li-blank-NINDS")).click();
        findElement(By.id("li-blank-Disease")).click();
        findElement(By.id("li-blank-Traumatic Brain Injury")).click();
        findElement(By.id("li-blank-Acute Hospitalized")).click();
        hangon(1);
        List<WebElement> elts = driver.findElements(By.id("li-blank-Classification"));
        for (int i = 0; i < elts.size(); i++) {
            if (elts.get(i).isDisplayed()) {
                elts.get(i).click();
                i = elts.size();
            }
        }
        findElement(By.id("li-blank-Basic")).click();
        Assert.assertTrue(textPresent("11 hits"));
        Assert.assertTrue(textPresent("Traffic accident other party role type"));
        findElement(By.id("li-checked-Acute Hospitalized")).click();
        Assert.assertTrue(textPresent("24 hits"));
        elts = driver.findElements(By.id("li-blank-Assessments and Examinations"));
        for (int i = 0; i < elts.size(); i++) {
            if (elts.get(i).isDisplayed()) {
                elts.get(i).click();
                i = elts.size();
            }
        }
        Assert.assertTrue(textPresent("8 hits"));
        findElement(By.id("li-checked-Disease")).click();
    }
    
    @Test
    public void facets() {
        mustBeLoggedInAs(cabigAdmin_username, cabigAdmin_password);
        goToSearch();
        findElement(By.name("ftsearch")).sendKeys("Study");
        findElement(By.id("search.submit")).click();
        Assert.assertTrue(textPresent("Candidate (10)"));
        findElement(By.id("li-blank-Candidate")).click();
        wait.until(ExpectedConditions.presenceOfElementLocated(By.partialLinkText("Intervention Trial Study Protocol Document Classification ")));
        hangon(1);
        List<WebElement> linkList = driver.findElements(By.cssSelector("div.panel-default"));
        Assert.assertEquals(linkList.size(), 10);
        findElement(By.id("li-blank-caBIG")).click();
        // Seems like we should wait for something , like below, but below doesn't work and I can't come up with something to wait for ...
//            wait.until(ExpectedConditions.not(ExpectedConditions.presenceOfElementLocated(
//                    By.linkText("caBIG -- First Follow-up Visit Date"))));
        hangon(1);
        linkList = driver.findElements(By.cssSelector("div.panel-default"));
        Assert.assertEquals(linkList.size(), 9);
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
        goToSearch();
        findElement(By.id("li-blank-CTEP")).click();
        // next line should make it wait.
        findElement(By.cssSelector("i.fa-check-square-o"));
        hangon(1);
        findElement(By.linkText("Next")).click();
        Assert.assertTrue(textPresent("OPEN to Rave Standard "));
        findElement(By.cssSelector("i.fa-check-square-o"));
        
        scrollToTop();
        
        findElement(By.id("resetSearch")).click();
        Assert.assertTrue(textPresent("Qualified (4"));
        findElement(By.name("ftsearch")).sendKeys("Immunology");
        findElement(By.cssSelector("i.fa-search")).click();
        Assert.assertTrue(textPresent("Immunology Gonorrhea Assay Laboratory Finding Result"));
    }

    @Test
    public void classificationFilters() {
        goToSearch();
        findElement(By.name("ftsearch")).sendKeys("Image");
        findElement(By.id("search.submit")).click();
        Assert.assertTrue(textPresent("caBIG (8)"));
        findElement(By.id("li-blank-caBIG")).click();
        Assert.assertTrue(textPresent("Generic Image"));

        hangon(1);
        List <WebElement> linkList = driver.findElements(By.cssSelector("div.panel-default"));
        Assert.assertEquals(linkList.size(), 8);

        // Check that CTEP classification with 0 items does not show
        Assert.assertTrue(!driver.findElement(By.cssSelector("BODY")).getText().contains("Radiograph Evidence Type"));
        
        findElement(By.id("li-blank-Generic Image")).click();
        Assert.assertTrue(textPresent("genericimage (2)"));
        findElement(By.id("li-blank-gov.nih.nci.ivi.genericimage")).click();
        
        hangon(1);
        linkList = driver.findElements(By.cssSelector("div.panel-default"));
        Assert.assertEquals(linkList.size(), 2);
        
        // Now test unclicking everything
        findElement(By.id("li-checked-Generic Image")).click();
        hangon(1);
        linkList = driver.findElements(By.cssSelector("div.panel-default"));
        Assert.assertEquals(linkList.size(), 8);
        
        Assert.assertTrue(textPresent("Generic Image (2)"));
        findElement(By.id("li-blank-Generic Image")).click();
        
        hangon(1);
        linkList = driver.findElements(By.cssSelector("div.panel-default"));
        Assert.assertEquals(linkList.size(), 2);
        
        findElement(By.id("li-checked-caBIG")).click();
        hangon(1);
        linkList = driver.findElements(By.cssSelector("div.panel-default"));
        Assert.assertEquals(linkList.size(), 9);
    }
    
    @Test
    public void preferredStandardFacet() {
        mustBeLoggedInAs(nlm_username, nlm_password);
        goToCdeByName("Noncompliant Reason Text");
        findElement(By.id("editStatus")).click();
        modalHere();
        new Select(driver.findElement(By.name("registrationStatus"))).selectByVisibleText("Preferred Standard");
        Assert.assertTrue(textPresent("Standard CDEs cannot be edited by their stewards"));
        modalHere();
        findElement(By.id("saveRegStatus")).click();
        hangon(1);
        goToSearch();          
        findElement(By.id("li-blank-Preferred Standard")).click();
        hangon(2);
        Assert.assertTrue(textPresent("Noncompliant Reason Text"));
    }
    
    @Test
    public void ownerAndAdminCanSeeLowStatus() {
        mustBeLoggedInAs(ctepCurator_username, ctepCurator_password);
        String cdeName = "Low Status Cde";
        new CdeEditTest().createCde(cdeName, "Low Stat Definition", "0.1", "CTEP");
        goToSearch();
        findElement(By.id("li-blank-Incomplete")).click();
        Assert.assertTrue(textPresent(cdeName));
        
        mustBeLoggedInAs(cabigAdmin_username, cabigAdmin_password);
        goToSearch();
        hangon(1);
        if (!textNotPresent("Incomplete (")) {
            findElement(By.id("li-blank-Incomplete")).click();
            Assert.assertTrue(textNotPresent(cdeName));
        }
        
        mustBeLoggedInAs(nlm_username, nlm_password);
        goToSearch();
        findElement(By.id("li-blank-Incomplete")).click();
        Assert.assertTrue(textPresent(cdeName));

        mustBeLoggedInAs(ctepCurator_username, ctepCurator_password);
        goToCdeByName(cdeName);
        findElement(By.id("editStatus")).click();
        new Select(driver.findElement(By.name("registrationStatus"))).selectByVisibleText("Candidate");
        findElement(By.id("saveRegStatus")).click();
        hangon(2);

        goToSearch();
        findElement(By.id("li-blank-Candidate")).click();
        Assert.assertTrue(textPresent(cdeName));
        
        mustBeLoggedInAs(cabigAdmin_username, cabigAdmin_password);
        goToSearch();
        hangon(1);
        if (!textNotPresent("Incomplete (")) {
            findElement(By.id("li-blank-Candidate")).click();
            Assert.assertTrue(textNotPresent(cdeName));
        }
        
        mustBeLoggedInAs(nlm_username, nlm_password);
        goToSearch();
        findElement(By.id("li-blank-Candidate")).click();
        Assert.assertTrue(textPresent(cdeName));
        
        
    }
    
    
}
