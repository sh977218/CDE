package gov.nih.nlm.user;

import gov.nih.nlm.system.NlmCdeBaseTest;
import org.openqa.selenium.By;
import org.openqa.selenium.JavascriptExecutor;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.support.ui.ExpectedConditions;
import org.openqa.selenium.support.ui.WebDriverWait;
import org.testng.Assert;
import org.testng.annotations.Test;

import java.time.Duration;

public class SearchSettings extends NlmCdeBaseTest {
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
        textPresent("No results were found.");
        driver.get(baseUrl + "/form/search?selectedOrg=NINDS");
        textNotPresent("Recorded (", By.id("registrationStatusListHolder"));
    }

    private void drafts() {
        driver.get(baseUrl + "/cde/search?selectedOrg=ACRIN");
        textPresent("3 results. Sorted by relevance."); // 3 Candidate, 1 Incomplete not shown
        driver.get(baseUrl + "/form/search?selectedOrg=NINDS");
        textPresent("Recorded (", By.id("registrationStatusListHolder"));
    }

    @Test
    public void searchSettings() {
        noDrafts();

        mustBeLoggedInAs(ninds_username, password);
        noDrafts();

        goToSearchSettings();
        driver.findElement(By.xpath("//*[@id='viewPublishAndDraftButton']//input")).click();
        hangon(5);
        closeAlert("Saved");
        drafts();

        logout();
        noDrafts();

        mustBeLoggedInAs(ninds_username, password);
        drafts();

        goToSearchSettings();
        driver.findElement(By.xpath("//*[@id='viewPublishOnlyButton']//input")).click();
        hangon(5);

        closeAlert("Saved");
        hangon(5);
        noDrafts();

        logout();
        noDrafts();
    }
}
