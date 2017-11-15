package gov.nih.nlm.cde.test;

import gov.nih.nlm.system.NlmCdeBaseTest;
import org.openqa.selenium.By;
import org.openqa.selenium.support.ui.ExpectedConditions;
import org.testng.Assert;
import org.testng.annotations.Test;

public class CdeCannotEditSomeDraftTabsTest extends NlmCdeBaseTest {

    @Test
    public void cdeCannotEditSomeDraftTabs() {
        String cdeName = "Draft Cde Test";
        mustBeLoggedInAs(nlm_username, nlm_password);
        goToCdeByName(cdeName);
        goToClassification();
        textPresent("Go to current non-draft version to see classifications");
        goToAttachments();
        textPresent("Go to current non-draft version to see attachments");
        clickElement(By.id("discussBtn"));
        textPresent("Go to current non-draft version to see comments");

        clickElement(By.id("viewPublished"));
        goToNaming();
        findElement(By.xpath("//button[contains (., 'View Draft')]"));
        Assert.assertEquals(driver.findElements(By.id("openNewNamingModalBtn")).size(), 0);
    }
}


