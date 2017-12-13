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
        findElement(By.id("ftsearch-input")).sendKeys("specimen");
        textNotPresent("Specimen laterality");
        textPresent("Cell Specimen");
        clickElement(By.xpath("//ngb-highlight[contains(., \"Cell Specimen Requirement\")]"));
        textPresent("The smallest units of living structure capable of independent existence");

        mustBeLoggedInAs(nlm_username, nlm_password);

//        goToSearch("form");
//        findElement(By.id("ftsearch-input")).sendKeys("prom iso");
//        Assert.assertEquals(findElement(By.xpath("//div[@id='searchDiv']//ngb-highlight[1]")).getText(), "promis isolation");
    }

}