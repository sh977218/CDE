package gov.nih.nlm.user;

import gov.nih.nlm.system.NlmCdeBaseTest;
import org.openqa.selenium.By;
import org.openqa.selenium.support.ui.ExpectedConditions;
import org.testng.Assert;
import org.testng.annotations.Test;

public class SearchSettings extends NlmCdeBaseTest {

    @Test
    public void retiredTest() {
        goToCdeSearch();
        clickElement(By.id("searchSettings"));
        assertNoElt(By.xpath("//label[input[@type='checkbox']][normalize-space()='Include Retired Content (this session only)']"));

        mustBeLoggedInAs(ninds_username, password);
        assertNoElt(By.xpath("//label[input[@type='checkbox']][normalize-space()='Include Retired Content (this session only)']"));

        mustBeLoggedInAs(nlm_username, nlm_password);
        clickElement(By.id("searchSettings"));
        findElement(By.xpath("//label[input[@type='checkbox']][normalize-space()='Include Retired Content (this session only)']"));
    }

    @Test
    public void searchDrafts() {
        // ACRIN org Curator
        mustBeLoggedInAs("acrin", password);
        driver.get(baseUrl + "/cde/search?selectedOrg=ACRIN");
        textPresent("Candidate (", By.id("registrationStatusListHolder"));
        driver.get(baseUrl + "/cde/search?selectedOrg=CCR");
        textNotPresent("Candidate (", By.id("registrationStatusListHolder"));

        // sys admin
        mustBeLoggedInAs(nlm_username, nlm_password);
        driver.get(baseUrl + "/cde/search?selectedOrg=ACRIN");
        textPresent("Candidate (", By.id("registrationStatusListHolder"));
        textPresent("Incomplete (", By.id("registrationStatusListHolder"));
        driver.get(baseUrl + "/cde/search?selectedOrg=CCR");
        textPresent("Candidate (", By.id("registrationStatusListHolder"));
        driver.get(baseUrl + "/cde/search?selectedOrg=TEST");
        textPresent("Incomplete (", By.id("registrationStatusListHolder"));
    }

}
