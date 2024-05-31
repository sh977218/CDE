package gov.nih.nlm.form.test.roles;

import gov.nih.nlm.system.NlmCdeBaseTest;
import org.openqa.selenium.By;
import org.testng.annotations.Test;

public class GovernanceGroup extends NlmCdeBaseTest {

    @Test()
    public void governanceGroup() {
        mustBeLoggedInAs(governanceUser, password);
        goToSearchSettings();
        clickElement(By.id("viewPublishAndDraftButton"));
        checkAlert("Saved");

        goToCdeSearch();
        clickElement(By.id("browseOrg-ACRIN"));
        textPresent("Candidate (");
        clickElement(By.xpath("//a[contains(.,'DCE-MRI Kinetics T1 Mapping Quality Type')]"));
        goToCdeSummary();
        assertNoElt(By.xpath("//cde-registration//button[contains(.,'Edit')]"));
        assertNoElt(By.xpath("//button[contains(.,'Add Name')]"));
        assertNoElt(By.xpath("//button[contains(.,'Upload more files')]"));

        goToFormSearch();
        clickElement(By.id("browseOrg-TEST"));
        textPresent("Incomplete (");
        clickElement(By.xpath("//a[contains(.,'ALS Score Form')]"));
        findElement(By.xpath("//h2[contains(.,'General Details')]"));
        assertNoElt(By.xpath("//cde-registration//button[contains(.,'Edit')]"));
        assertNoElt(By.xpath("//button[contains(.,'Add Name')]"));
        assertNoElt(By.xpath("//button[contains(.,'Upload more files')]"));
    }
}
