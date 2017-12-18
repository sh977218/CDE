package gov.nih.nlm.cde.test;

import gov.nih.nlm.system.NlmCdeBaseTest;
import org.openqa.selenium.By;
import org.testng.Assert;
import org.testng.annotations.Test;

public class AutoCompletionWelcomeTest extends NlmCdeBaseTest {

    @Test
    public void AutoCompletionWelcome() {
        mustBeLoggedOut();
        goToSearch("cde");
        findElement(By.id("ftsearch-input")).sendKeys("specimen lat");
        textNotPresent("Specimen Laterality");
        textPresent("Cell Specimen");
        clickElement(By.xpath("//ngb-highlight[contains(., \"Cell Specimen Requirement\")]"));
        textPresent("The smallest units of living structure capable of independent existence");

        setLowStatusesVisible();
        goToSearch("cde");
        findElement(By.id("ftsearch-input")).sendKeys("specimen lat");
        textPresent("Specimen Laterality");
        clickElement(By.xpath("//ngb-highlight[contains(., \"Specimen Laterality Not Specified Reason\")]"));
        textPresent("02/03/2016");
    }

    @Test
    public void AutoCompletionWelcomeForm() {
        mustBeLoggedOut();
        goToSearch("form");
        findElement(By.id("ftsearch-input")).sendKeys("multi");
        textNotPresent("MultiSelect");
        clickElement(By.xpath("//ngb-highlight[contains(., \"Multiple Sclerosis Quality of Life\")]"));
        textPresent("Rendering has been disabled for this form.");

        setLowStatusesVisible();
        goToSearch("form");
        findElement(By.id("ftsearch-input")).sendKeys("multi");
        clickElement(By.xpath("//ngb-highlight[contains(., \"MultiSelect Logic\")]"));
        textPresent("Medicaid");
    }

}