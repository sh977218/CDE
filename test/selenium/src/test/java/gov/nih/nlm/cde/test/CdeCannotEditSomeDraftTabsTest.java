package gov.nih.nlm.cde.test;

import gov.nih.nlm.system.NlmCdeBaseTest;
import org.openqa.selenium.By;
import org.testng.annotations.Test;

public class CdeCannotEditSomeDraftTabsTest extends NlmCdeBaseTest {
    @Test
    public void formCannotEditSomeDraftTabs() {
        String cdeName = "Draft Cde Test";
        mustBeLoggedInAs(nlm_username, nlm_password);
        goToCdeByName(cdeName);
        clickElement(By.id("classification_tab"));
        textPresent("Go to current non-draft version to see classifications");
        clickElement(By.id("attachments_tab"));
        textPresent("Go to current non-draft version to see attachments");
        clickElement(By.id("discussBtn"));
        textPresent("Go to current non-draft version to see comments");
    }
}


