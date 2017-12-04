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
        textPresent("Classification is not available in Drafts.");
        goToAttachments();
        textPresent("Attachments are not available in Drafts.");
        clickElement(By.id("discussBtn"));
        textPresent("Discussion is not available in Drafts.");

        textPresent("DRAFT");
        textNotPresent("Published");
        clickElement(By.cssSelector(".toggle-switch"));

        goToNaming();

        textPresent("Published");
        textNotPresent("DRAFT");
        clickElement(By.cssSelector(".toggle-switch"));

        Assert.assertEquals(driver.findElements(By.id("openNewNamingModalBtn")).size(), 0);
    }
}


