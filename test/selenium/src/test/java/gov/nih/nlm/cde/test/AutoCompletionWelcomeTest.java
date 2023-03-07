package gov.nih.nlm.cde.test;

import gov.nih.nlm.system.NlmCdeBaseTest;
import org.openqa.selenium.By;
import org.testng.Assert;
import org.testng.annotations.Test;

public class AutoCompletionWelcomeTest extends NlmCdeBaseTest {

    @Test
    public void AutoCompletionWelcome() {
        goToCdeSearch();
        findElement(By.id("ftsearch-input")).sendKeys("specimen lat*");
        textNotPresent("Specimen Laterality");
        textPresent("Cell Specimen");
        selectMatDropdownByText("Cell Specimen Requirement Pathology Finding Status Specimen Histopathological Text Type");
        textPresent("The smallest units of living structure capable of independent existence");

        mustBeLoggedInAs(nlm_username, nlm_password);
        goToCdeSearch();
        findElement(By.id("ftsearch-input")).sendKeys("specimen lat");
        textPresent("Specimen Laterality");
        selectMatDropdownByText("Specimen Laterality Not Specified Reason");
        textPresent("02/03/2016");
    }

    @Test
    public void AutoCompletionWelcomeForm() {
        goToSearch("form");
        findElement(By.id("ftsearch-input")).sendKeys("multi");
        textNotPresent("MultiSelect");
        selectMatDropdownByText("Multiple Sclerosis Quality of Life (MSQOL)-54");
        textPresent("Rendering has been disabled for this form.");

        mustBeLoggedInAs(nlm_username, nlm_password);
        goToSearch("form");
        findElement(By.id("ftsearch-input")).sendKeys("multi");
        selectMatDropdownByText("MultiSelect Logic");
        textPresent("Medicaid");
    }

}