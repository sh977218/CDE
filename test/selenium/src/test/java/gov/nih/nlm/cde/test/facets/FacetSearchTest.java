package gov.nih.nlm.cde.test.facets;

import gov.nih.nlm.system.NlmCdeBaseTest;
import org.openqa.selenium.By;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.support.ui.Select;
import org.testng.Assert;
import org.testng.annotations.Test;

import java.util.List;

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
        mustBeLoggedOut();
        setLowStatusesVisible();
        findElement(By.id("li-blank-Preferred Standard")).click();
        hangon(1);
        findElement(By.id("li-blank-Standard")).click();
        hangon(1);
        findElement(By.id("li-blank-Qualified")).click();

        textNotPresent("GRDR (75)");
        textPresent("CCR (4");
        findElement(By.id("li-blank-Recorded")).click();
        textPresent("GRDR (75)");
        textPresent("NINDS (91");
        findElement(By.id("li-checked-Qualified")).click();
        textNotPresent("NINDS (9");
        findElement(By.id("li-checked-Recorded")).click();
        hangon(1);
        findElement(By.id("li-checked-Standard")).click();
        hangon(1);
        waitAndClick(By.id("li-checked-Preferred Standard"));
        textPresent("NINDS (91");
        textPresent("All Statuses");
    }

    @Test
    public void statusFacets() {
        goToCdeSearch();
        textPresent("Qualified (94");
        findElement(By.id("li-blank-caBIG")).click();
        findElement(By.cssSelector("i.fa-square-o"));
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
    public void regStatusFacets() {
        mustBeLoggedOut();
        setLowStatusesVisible();
        findElement(By.id("li-blank-caBIG")).click();
        findElement(By.id("li-blank-ASCO")).click();
        textPresent("Agent Physical Appearance Type");
        textPresent("First Follow-up Visit Date");
        textPresent("Heart MUGA Test Date");
        textPresent("Axillary Surgery Dissection Date");
        textPresent("Patient Name");
        textPresent("Person Gender Text Type");
        textPresent("Person Birth Date");
        textPresent("Patient Ethnic Group Category");

        findElement(By.id("li-blank-Standard")).click();
        textNotPresent("Agent Physical Appearance Type");
        textNotPresent("First Follow-up Visit Date");
        textNotPresent("Heart MUGA Test Date");
        textPresent("Person Gender Text Type");
        textPresent("Person Birth Date");
        textNotPresent("Patient Ethnic Group Category");

        scrollToTop();
        findElement(By.id("li-checked-Standard")).click();
        hangon(1);
        findElement(By.id("li-blank-Qualified")).click();
        textNotPresent("Agent Physical Appearance Type");
        textNotPresent("First Follow-up Visit Date");
        textPresent("Heart MUGA Test Date");
        textPresent("Patient Name");
        textNotPresent("Person Gender Text Type");
        textNotPresent("Person Birth Date");
        textPresent("Patient Ethnic Group Category");

        scrollToTop();
        findElement(By.id("li-checked-Qualified")).click();
        hangon(1);
        findElement(By.id("li-blank-Candidate")).click();
        textPresent("Agent Physical Appearance Type");
        textPresent("First Follow-up Visit Date");
        textNotPresent("Heart MUGA Test Date");
        textNotPresent("Axillary Surgery Dissection Date");
        textNotPresent("Patient Name");
        textNotPresent("Person Gender Text Type");
        textNotPresent("Person Birth Date");
        textNotPresent("Patient Ethnic Group Category");
    }
    
    @Test
    public void facetPagination() {
        goToCdeSearch();
        findElement(By.id("li-blank-CTEP")).click();
        // next line should make it wait.
        textPresent("OPEN to Rave");
        hangon(1);
        findElement(By.linkText("Next")).click();
        textPresent("OPEN to Rave Standard ");
        //findElement(By.cssSelector("i.fa-check-square-o"));
        
        scrollToTop();
        
        findElement(By.id("resetSearch")).click();
        Assert.assertTrue(textPresent("Qualified (94"));
        findElement(By.name("ftsearch")).sendKeys("Immunology");
        findElement(By.cssSelector("i.fa-search")).click();
        Assert.assertTrue(textPresent("Immunology Gonorrhea Assay Laboratory Finding Result"));
    }

    
    @Test
    public void preferredStandardFacet() {
        mustBeLoggedInAs(nlm_username, nlm_password);
        goToCdeByName("Noncompliant Reason Text");
        findElement(By.id("editStatus")).click();
        new Select(driver.findElement(By.name("registrationStatus"))).selectByVisibleText("Preferred Standard");
        textPresent("Standard elements cannot be edited by their stewards");
        findElement(By.id("saveRegStatus")).click();
        waitForESUpdate();
        goToCdeSearch();  
        textPresent("Preferred Standard");
        findElement(By.id("li-blank-Standard")).click();
        hangon(1);
        findElement(By.id("li-blank-Qualified")).click();
        hangon(1);
        textNotPresent("Noncompliant Reason Text");
    }
    
}