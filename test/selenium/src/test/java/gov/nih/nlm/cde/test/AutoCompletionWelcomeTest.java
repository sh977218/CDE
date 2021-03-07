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
        clickElement(By.xpath("//span[@class='mat-option-text' and contains(., 'Cell Specimen Requirement')]"));
        textPresent("The smallest units of living structure capable of independent existence");

        mustBeLoggedInAs(nlm_username, nlm_password);
        goToCdeSearch();
        findElement(By.id("ftsearch-input")).sendKeys("specimen lat");
        textPresent("Specimen Laterality");
        clickElement(By.xpath("//span[@class='mat-option-text' and contains(., 'Specimen Laterality Not Specified Reason')]"));
        textPresent("02/03/2016");
    }

    @Test
    public void AutoCompletionWelcomeForm() {
        goToSearch("form");
        findElement(By.id("ftsearch-input")).sendKeys("multi");
        textNotPresent("MultiSelect");
        clickElement(By.xpath("//span[@class='mat-option-text' and contains(., 'Multiple Sclerosis Quality of Life')]"));
        textPresent("Rendering has been disabled for this form.");

        mustBeLoggedInAs(nlm_username, nlm_password);
        goToSearch("form");
        findElement(By.id("ftsearch-input")).sendKeys("multi");
        clickElement(By.xpath("//span[@class='mat-option-text' and contains(., 'MultiSelect Logic')]"));
        textPresent("Medicaid");
    }

}