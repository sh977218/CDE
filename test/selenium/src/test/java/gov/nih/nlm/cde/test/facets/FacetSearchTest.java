package gov.nih.nlm.cde.test.facets;

import gov.nih.nlm.system.NlmCdeBaseTest;
import org.openqa.selenium.By;
import org.testng.Assert;
import org.testng.annotations.Test;

public class FacetSearchTest extends NlmCdeBaseTest {

    @Test
    public void stewardFacets() {
        mustBeLoggedOut();
        goToCdeSearch();
        clickElement(By.id("browseOrg-caBIG"));
        int numOfElts = Integer.valueOf(findElement(By.xpath("//*[@id='nbOfClassifElts-All Candidates']")).getText());

        clickElement(By.xpath("//*[@id='li-blank-All Candidates']"));

        textPresent(numOfElts + " results for All Terms | caBIG > All Candidates | All Topics | All Statuses");
    }

    @Test
    public void statusFacets() {
        goToCdeSearch();
        int numOfCipElts = Integer.valueOf(findElement(By.id("nbOfElts-CIP")).getText());
        clickElement(By.id("browseOrg-CIP"));
        textPresent("Qualified (" + numOfCipElts + ")");
        int numOfLidcElts = Integer.valueOf(findElement(By.id("nbOfClassifElts-LIDC")).getText());
        clickElement(By.id("li-blank-LIDC"));
        textPresent("Qualified (" + numOfLidcElts + ")");
    }

    @Test
    public void deepFacets() {
        goToCdeSearch();
        clickElement(By.id("browseOrg-NINDS"));
        clickElement(By.id("li-blank-Disease"));
        clickElement(By.xpath("//*[@id='li-blank-Traumatic Brain Injury']"));
        clickElement(By.xpath("//*[@id='li-blank-Acute Hospitalized']"));
        clickElement(By.id("li-blank-Classification"));
        int numRes = getNumberOfResults();
        clickElement(By.id("li-blank-Basic"));
        textNotPresent(numRes + " results for");
        numRes = getNumberOfResults();
        Assert.assertTrue(numRes > 248);
        Assert.assertTrue(numRes < 254);
        clickElement(By.xpath("//*[@id='li-checked-Acute Hospitalized']"));
        textPresent("Domain (19");
        clickElement(By.id("li-blank-Domain"));
        textPresent("Outcomes and End Points (12");
        scrollToTop();
        clickElement(By.id("li-checked-Disease"));
        textPresent("Population (111");
    }

    @Test
    public void regStatusFacets() {
        mustBeLoggedOut();
        setLowStatusesVisible();
        clickElement(By.id("browseOrg-caBIG"));
        clickElement(By.id("li-blank-ASCO"));
        textPresent("Agent Physical Appearance Type");
        textPresent("First Follow-up Visit Date");
        textPresent("Heart MUGA Test Date");
        textPresent("Axillary Surgery Dissection Date");
        textPresent("Patient Name");
        textPresent("Person Gender Text Type");
        textPresent("Person Birth Date");
        textPresent("Patient Ethnic Group Category");

        clickElement(By.id("li-blank-Standard"));
        textNotPresent("Agent Physical Appearance Type");
        textNotPresent("First Follow-up Visit Date");
        textNotPresent("Heart MUGA Test Date");
        textPresent("Person Gender Text Type");
        textPresent("Person Birth Date");
        textNotPresent("Patient Ethnic Group Category");

        scrollToTop();
        clickElement(By.id("li-checked-Standard"));
        hangon(1);
        clickElement(By.id("li-blank-Qualified"));
        textNotPresent("Agent Physical Appearance Type");
        textNotPresent("First Follow-up Visit Date");
        textPresent("Heart MUGA Test Date");
        textPresent("Patient Name");
        textNotPresent("Person Gender Text Type");
        textNotPresent("Person Birth Date");
        textPresent("Patient Ethnic Group Category");

        scrollToTop();
        clickElement(By.id("li-checked-Qualified"));
        hangon(1);
        clickElement(By.id("li-blank-Candidate"));
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
        clickElement(By.id("browseOrg-CTEP"));

        int numOfDiseaseElts = Integer.valueOf(findElement(By.id("nbOfClassifElts-DISEASE")).getText());

        clickElement(By.id("li-blank-DISEASE"));

        textPresent(numOfDiseaseElts + " results for");

        int expectedNumberOfPages = (int) Math.ceil((double) numOfDiseaseElts / 20);
        for (int i = 1; i < expectedNumberOfPages; i++) {
            findElement(By.partialLinkText("" + i));
        }
        Assert.assertEquals(0, driver.findElements(By.partialLinkText("" + (expectedNumberOfPages + 1))).size());
    }


}
