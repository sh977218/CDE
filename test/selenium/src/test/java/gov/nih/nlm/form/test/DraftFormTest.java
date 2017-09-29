package gov.nih.nlm.form.test;

import gov.nih.nlm.system.NlmCdeBaseTest;
import org.openqa.selenium.By;
import org.testng.annotations.Test;

public class DraftFormTest extends NlmCdeBaseTest {
    @Test
    public void draftFormLogout() {
        String formName = "Draft Form Test";
        mustBeLoggedOut();
        goToFormByName(formName);
        textNotPresent("Draft");
    }

    @Test
    public void draftFormLogin() {
        String formName = "Draft Form Test";
        mustBeLoggedInAs(nlm_username, nlm_password);
        goToFormByName(formName);
        clickElement(By.id("classification_tab"));
        textPresent("Go to current non-draft version to see classifications");
        clickElement(By.id("attachments_tab"));
        textPresent("Go to current non-draft version to see attachments");
        clickElement(By.id("discussBtn"));
        textPresent("Go to current non-draft version to see comments");
    }
}


