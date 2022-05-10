package gov.nih.nlm.cde.test.facets;

import gov.nih.nlm.system.NlmCdeBaseTest;
import org.openqa.selenium.By;
import org.testng.Assert;
import org.testng.annotations.Test;

public class FacetSearchTest extends NlmCdeBaseTest {

    @Test
    public void stewardFacets() {
        goToCdeSearch();
        clickElement(By.id("browseOrg-caBIG"));
        String numOfElts = findElement(By.xpath("//*[@id='nbOfClassifElts-All Candidates']")).getText();

        clickElement(By.id("classif-All Candidates"));

        textPresent(numOfElts, By.id("searchResultNum"));
        checkSearchResultInfo(null, new String[]{"caBIG", "All Candidates"}, null, null, null);
    }

    @Test
    public void statusFacets() {
        goToCdeSearch();
        int numOfCipElts = Integer.valueOf(findElement(By.id("nbOfElts-CIP")).getText());
        clickElement(By.id("browseOrg-CIP"));
        textPresent("Qualified (" + numOfCipElts + ")");
        int numOfLidcElts = Integer.valueOf(findElement(By.id("nbOfClassifElts-LIDC")).getText());
        clickElement(By.id("classif-LIDC"));
        textPresent("Qualified (" + numOfLidcElts + ")");
    }

    @Test
    public void deepFacets() {
        goToCdeSearch();
        clickElement(By.id("browseOrg-NINDS"));
        clickElement(By.id("classif-Disease"));
        clickElement(By.id("classif-Traumatic Brain Injury"));
        clickElement(By.id("classif-Acute Hospitalized"));
        clickElement(By.id("classif-Classification"));
        int numRes = getNumberOfResults();
        clickElement(By.id("classif-Basic"));
        textNotPresent(numRes + "data element results");
        numRes = getNumberOfResults();
        Assert.assertTrue(numRes > 248);
        Assert.assertTrue(numRes < 254);
        assertSearchFilterSelected("classif-Acute Hospitalized", true);
        clickElement(By.id("classif-Traumatic Brain Injury"));
        textPresent("Domain");
        clickElement(By.id("classif-Domain"));
        textPresent("Outcomes and End Points (12");
        scrollToTop();
        assertSearchFilterSelected("classif-Disease", true);
        clickElement(By.id("classif-NINDS"));
        textPresent("Population (111");
    }

    @Test
    public void regStatusFacets() {
        mustBeLoggedInAs(nlm_username, nlm_password);
        goToSearch("cde");
        clickElement(By.id("browseOrg-caBIG"));
        clickElement(By.id("classif-ASCO"));
        textPresent("Agent Physical Appearance Type");
        textPresent("First Follow-up Visit Date");
        textPresent("Heart MUGA Test Date");
        textPresent("Axillary Surgery Dissection Date");
        textPresent("Patient Name");
        textPresent("Person Gender Text Type");
        textPresent("Person Birth Date");
        textPresent("Patient Ethnic Group Category");

        clickElement(By.id("regstatus-Standard"));
        textNotPresent("Agent Physical Appearance Type");
        textNotPresent("First Follow-up Visit Date");
        textNotPresent("Heart MUGA Test Date");
        textPresent("Person Gender Text Type");
        textPresent("Person Birth Date");
        textNotPresent("Patient Ethnic Group Category");

        scrollToTop();
        assertSearchFilterSelected("regstatus-Standard", true);
        clickElement(By.id("regstatus-Standard"));
        hangon(1);
        assertSearchFilterSelected("regstatus-Qualified", false);
        clickElement(By.id("regstatus-Qualified"));
        textNotPresent("Agent Physical Appearance Type");
        textNotPresent("First Follow-up Visit Date");
        textPresent("Heart MUGA Test Date");
        textPresent("Patient Name");
        textNotPresent("Person Gender Text Type");
        textNotPresent("Person Birth Date");
        textPresent("Patient Ethnic Group Category");

        scrollToTop();
        assertSearchFilterSelected("regstatus-Qualified", true);
        clickElement(By.id("regstatus-Qualified"));
        hangon(1);
        assertSearchFilterSelected("regstatus-Candidate", false);
        clickElement(By.id("regstatus-Candidate"));
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

        clickElement(By.id("classif-DISEASE"));

        textPresent(numOfDiseaseElts + " data element results");
        scrollDownBy(10000);
        textPresent("1 – 20 of " + numOfDiseaseElts);
    }


}
