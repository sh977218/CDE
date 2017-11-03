package gov.nih.nlm.form.test;

import gov.nih.nlm.system.NlmCdeBaseTest;
import org.openqa.selenium.By;
import org.testng.annotations.Test;

public class FormCannotEditSomeDraftTabsTest extends NlmCdeBaseTest {
    @Test
    public void formCannotEditSomeDraftTabs() {
        String formName = "Draft Form Test";
        mustBeLoggedInAs(nlm_username, nlm_password);
        goToFormByName(formName);
        goToClassification();
        textPresent("Go to current non-draft version to see classifications");
        goToAttachments();
        textPresent("Go to current non-draft version to see attachments");
        clickElement(By.id("discussBtn"));
        textPresent("Go to current non-draft version to see comments");
    }
}


