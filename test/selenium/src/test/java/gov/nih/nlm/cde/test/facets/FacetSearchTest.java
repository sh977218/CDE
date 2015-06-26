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
        mustBeLoggedOut();

        textNotPresent("GRDR (75)");
        findElement(By.id("browseOrg-GRDR"));
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
        int numOfCipElts = Integer.valueOf(findElement(By.id("nbOfElts-CIP")).getText());
        findElement(By.id("browseOrg-CIP")).click();
        textPresent("Qualified (" + numOfCipElts + ")");
        int numOfLidcElts = Integer.valueOf(findElement(By.id("nbOfClassifElts-LIDC")).getText());
        findElement(By.id("li-blank-LIDC")).click();
        textPresent("Qualified (" + numOfLidcElts + ")");
    }

    @Test
    public void deepFacets() {
        goToCdeSearch();
        findElement(By.id("browseOrg-NINDS")).click();
        findElement(By.id("li-blank-Disease")).click();
        findElement(By.id("li-blank-Traumatic Brain Injury")).click();
        findElement(By.id("li-blank-Acute Hospitalized")).click();
        findElement(By.id("li-blank-Classification")).click();
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
        findElement(By.id("browseOrg-caBIG")).click();
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
        findElement(By.id("browseOrg-CTEP")).click();

        int numOfDiseaseElts = Integer.valueOf(findElement(By.id("nbOfClassifElts-DISEASE")).getText());

        findElement(By.id("li-blank-DISEASE")).click();

        textPresent(numOfDiseaseElts + " results for");

        int expectedNumberOfPages = (int) Math.ceil((double)numOfDiseaseElts / 20);
        for (int i = 1; i < expectedNumberOfPages; i ++) {
            findElement(By.linkText("" + i));
        }
        Assert.assertEquals(0, driver.findElements(By.linkText("" + (expectedNumberOfPages + 1))).size());
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
        findElement(By.id("browseOrg-DCP"));
        textNotPresent("Noncompliant Reason Text");
        textPresent("Preferred Standard (");
        findElement(By.id("li-blank-Standard")).click();
        textNotPresent("Noncompliant Reason Text");
    }
    
}
