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

    private void noDrafts() {
        driver.get(baseUrl + "/cde/search?selectedOrg=ACRIN");
        textPresent("0 data element results for");
        driver.get(baseUrl + "/form/search?selectedOrg=NINDS");
        textNotPresent("Recorded (", By.id("registrationStatusListHolder"));
    }

    private void drafts() {
        driver.get(baseUrl + "/cde/search?selectedOrg=ACRIN");
        textPresent("3 data element results for"); // 3 Candidate, 1 Incomplete not shown
        driver.get(baseUrl + "/form/search?selectedOrg=NINDS");
        textPresent("Recorded (", By.id("registrationStatusListHolder"));
    }

    @Test
    public void searchSettings() {
        noDrafts();

        mustBeLoggedInAs(ninds_username, password);
        noDrafts();

        goToSearchSettings();
        findElement(By.cssSelector("mat-radio-button input[value='false']:checked"));
        clickElement(By.xpath("//mat-radio-button[*//input[@value='true']]"));
        hangon(1);
        findElement(By.cssSelector("mat-radio-button input[value='true']:checked"));
        drafts();

        logout();
        noDrafts();

        mustBeLoggedInAs(ninds_username, password);
        drafts();

        goToSearchSettings();
        findElement(By.cssSelector("mat-radio-button input[value='true']:checked"));
        clickElement(By.xpath("//mat-radio-button[*//input[@value='false']]"));
        hangon(1);
        findElement(By.cssSelector("mat-radio-button input[value='false']:checked"));
        noDrafts();

        logout();
        noDrafts();
    }
}
