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
        textPresent("Classification is not available in Drafts.");
        goToAttachments();
        textPresent("Attachments are not available in Drafts.");
    }

}


